import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScrapingService } from './scraping.service';
import { extractTitleFromDocumentPdf } from 'src/utils/extract-filename';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
import { IScrapedData } from '../invoice.types';

@Injectable()
export class InvoiceScraperService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly scrapingService: ScrapingService,
    ) {}

    private readonly MESSAGE_SCRAP_DATA_CLIENT_NOT_FOUND = 'Client not found';
    private readonly MESSAGE_SCRAP_EMPTY_DATA = 'Empty data scraped';
    private readonly MESSAGE_INVOICE_ALREADY_EXISTS = 'Invoice already exists';
    private readonly MESSAGE_INVOICE_INTERNAL_FILE = 'Error to scrap file data';
    private readonly MESSAGE_INVOICE_INTERNAL_WEBSITE = 'Error to scrap website data';
    private readonly MESSAGE_SCRAP_MISSING_VALUES = 'Source lacking field: ';

    async scrapPdfData({ clientId, file }: { clientId: number; file: Express.Multer.File }): Promise<Partial<IScrapedData>> {
        try {
            const { buffer, originalname } = file;

            const client = await this.prisma.client.findUnique({ where: { id: clientId } });
            if (!client) {
                throw new NotFoundException(this.MESSAGE_SCRAP_DATA_CLIENT_NOT_FOUND);
            }

            const scrapedData = await this.scrapingService.scrapeFromPdf(buffer);

            this.checkEmptyScrapedData(scrapedData, 'PDF');

            const title = extractTitleFromDocumentPdf(originalname);
            await this.prisma.invoice.create({
                data: {
                    title,
                    monetaryValue: scrapedData.monetaryValue,
                    invoiceExpiresDate: scrapedData.invoiceExpiresDate,
                    invoiceReferenceMonth: scrapedData.invoiceReferenceMonth,
                    issuerCnpj: scrapedData.issuerCnpj,
                    invoiceId: scrapedData.invoiceId,
                    postalCode: scrapedData.postalCode,
                    address: scrapedData.address,
                    neighborhood: scrapedData.neighborhood,
                    invoiceStatus: scrapedData.invoiceStatus ?? 'UNPAID',

                    client: {
                        connect: {
                            id: clientId,
                        },
                    },
                },
            });

            return { ...scrapedData, title };
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    throw new BadRequestException(this.MESSAGE_INVOICE_ALREADY_EXISTS);
                }

                if (e.code === 'P2025') {
                    throw new NotFoundException(this.MESSAGE_SCRAP_DATA_CLIENT_NOT_FOUND);
                }
            }

            throw new InternalServerErrorException(this.MESSAGE_INVOICE_INTERNAL_FILE, 'error: ' + e);
        }
    }

    async scrapWebSiteData({ clientId, url }): Promise<Partial<IScrapedData>> {
        try {
            const client = await this.prisma.client.findUnique({ where: { id: clientId } });
            if (!client) {
                throw new NotFoundException(this.MESSAGE_SCRAP_DATA_CLIENT_NOT_FOUND);
            }

            const scrapedWebSiteData = await this.scrapingService.scrapeFromWeb(url);
            this.checkEmptyScrapedData(scrapedWebSiteData, 'WEBSITE');

            await this.prisma.invoice.create({
                data: {
                    title: scrapedWebSiteData.title || 'standard',
                    monetaryValue: scrapedWebSiteData.monetaryValue,
                    invoiceExpiresDate: scrapedWebSiteData.invoiceExpiresDate,
                    invoiceReferenceMonth: scrapedWebSiteData.invoiceReferenceMonth,
                    issuerCnpj: scrapedWebSiteData.issuerCnpj,
                    invoiceId: scrapedWebSiteData.invoiceId,
                    postalCode: scrapedWebSiteData.postalCode,
                    address: scrapedWebSiteData.address,
                    neighborhood: scrapedWebSiteData.neighborhood,
                    invoiceStatus: scrapedWebSiteData.invoiceStatus ?? 'UNPAID',
                    paidInvoiceDate: scrapedWebSiteData.paidInvoiceDate,
                    client: {
                        connect: {
                            id: clientId,
                        },
                    },
                },
            });

            return scrapedWebSiteData;
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    throw new BadRequestException(this.MESSAGE_INVOICE_ALREADY_EXISTS);
                }

                if (e.code === 'P2025') {
                    throw new NotFoundException(this.MESSAGE_SCRAP_DATA_CLIENT_NOT_FOUND);
                }
            }

            throw new InternalServerErrorException(this.MESSAGE_INVOICE_INTERNAL_WEBSITE, 'error: ' + e);
        }
    }

    private checkEmptyScrapedData(scrapedData: Partial<IScrapedData>, type: 'WEBSITE' | 'PDF') {
        const valueScrapedData = Object.values(scrapedData);

        if (!scrapedData.title && type === 'WEBSITE') {
            throw new InternalServerErrorException(this.MESSAGE_SCRAP_MISSING_VALUES + 'title');
        }

        if (!scrapedData.invoiceId && type === 'WEBSITE') {
            throw new InternalServerErrorException(this.MESSAGE_SCRAP_MISSING_VALUES + 'invoiceId');
        }

        const isEmptyValues = valueScrapedData.every((e) => e === null);

        if (isEmptyValues) {
            throw new InternalServerErrorException(this.MESSAGE_SCRAP_EMPTY_DATA);
        }

        return true;
    }
}
