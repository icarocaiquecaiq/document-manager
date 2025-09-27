import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IScrapedPdfData, IScrapWebSiteDataInput } from '../invoice.types';
import apiClientHttp from 'src/utils/api';
import * as cheerio from 'cheerio';
import { ScrapingService } from './scraping.service';
import { extractTitleFromDocumentPdf } from 'src/utils/extract-filename';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

@Injectable()
export class InvoiceScraperService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly scrapingService: ScrapingService,
    ) {}

    private readonly MESSAGE_SCRAP_DATA_CLIENT_NOT_FOUND = 'Client not found';
    private readonly MESSAGE_SCRAP_EMPTY_DATA = 'Empty data scraped';
    private readonly MESSAGE_INVOICE_ALREADY_EXISTS = 'Invoice already exists';
    private readonly MESSAGE_INVOICE_INTERNAL_FILE = 'error to scrap file data';

    async scrapPdfData({ clientId, file }: { clientId: number; file: Express.Multer.File }) {
        try {
            const { buffer, originalname } = file;

            const client = await this.prisma.client.findUnique({ where: { id: clientId } });
            if (!client) {
                throw new NotFoundException(this.MESSAGE_SCRAP_DATA_CLIENT_NOT_FOUND);
            }

            const scrapedData = await this.scrapingService.scrapeFromPdf(buffer);

            this.checkEmptyScrapedData(scrapedData);

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

    async scrapWebSiteData({ clientId, url }: IScrapWebSiteDataInput) {
        const data = await this.useNoJavascriptToExtractWebsite(url);
        return data;
    }

    async useNoJavascriptToExtractWebsite(url: string) {
        const bodyHeadingOptions = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const headerTitle = 'title';
        const headerDescription = 'meta[property="og:description"]';

        const httpInstance = await apiClientHttp.get(url);

        const $ = cheerio.load(httpInstance.data);
    }

    async useJavascriptToExtractWebsite() {
        return 'extractwithJavascript';
    }

    private checkEmptyScrapedData(scrapedData: Object) {
        const valueScrapedData = Object.values(scrapedData);

        const isEmptyValues = valueScrapedData.every((e) => e === null);

        if (isEmptyValues) {
            throw new InternalServerErrorException(this.MESSAGE_SCRAP_EMPTY_DATA);
        }

        return true;
    }
}
