import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TExtractWebSiteData } from '../document.types';
import apiClientHttp from 'src/utils/api';
import * as cheerio from 'cheerio';
import pdf from 'pdf-parse';

export type TAddress = {
    address: string | null;
    postalCode: string | null;
    neighborhood: string | null;
};

export type TExtractedPdfData = {
    monetaryValue: number | null;
    invoiceExpiresDate: Date | null;
    issuerCnpj: string | null;
    invoiceId: string | null;
    address: string | null;
    postalCode: string | null;
    neighborhood: string | null;
    invoiceStatus: 'PAID' | 'UNPAID' | null;
    invoiceReferenceMonth: Date | null;
    title: string | null;
};

@Injectable()
export class DocumentScraplingService {
    constructor(private readonly prisma: PrismaService) {}

    private readonly MESSAGE_PDF_PROCESSING_ERROR = 'Error processing PDF file';
    private readonly MESSAGE_EXTRACT_TITLE_ERROR = 'Error extracting title from document';
    private readonly MESSAGE_EXTRACT_STATUS_ERROR = 'Error extracting invoice status';
    private readonly MESSAGE_EXTRACT_ADDRESS_ERROR = 'Error extracting address';
    private readonly MESSAGE_EXTRACT_ID_ERROR = 'Error extracting invoice ID';
    private readonly MESSAGE_EXTRACT_CNPJ_ERROR = 'Error extracting CNPJ';
    private readonly MESSAGE_EXTRACT_EXPIRES_DATE_ERROR = 'Error extracting expires invoice date';
    private readonly MESSAGE_EXTRACT_REFERENCE_MONTH_ERROR = 'Error extracting invoice reference month';
    private readonly MESSAGE_EXTRACT_MONETARY_VALUE_ERROR = 'Error extracting monetary value';
    private readonly MESSAGE_FORMAT_CURRENCY_ERROR = 'Error formatting currency value';

    async extractPdfData(clientId: number, file: Express.Multer.File) {
        try {
            const data = await pdf(file.buffer);
            const documentText = data.text;
            const addressInfo = this.extractAddressRegex(documentText);

            const extractedPdfData: TExtractedPdfData = {
                monetaryValue: this.extractMonetaryValueFromDocument(documentText),
                invoiceExpiresDate: this.extractInvoiceExpiresDateFromDocument(documentText),
                issuerCnpj: this.extractIssuerCnpj(documentText),
                invoiceId: this.extractInvoiceIdFromDocument(documentText),
                address: addressInfo.address,
                postalCode: addressInfo.postalCode,
                neighborhood: addressInfo.neighborhood,
                invoiceStatus: this.extractInvoiceStatusFromDocument(documentText),
                invoiceReferenceMonth: this.extractInvoiceReferenceMonthFromDocument(documentText),
                title: this.extractTitleFromDocument(file.originalname),
            };

            return {
                filename: file.originalname,
                pages: data.numpages,
                metadata: data.info,
                text: data.text,
                extractedPdfData,
                clientId,
            };
        } catch (error) {
            throw new InternalServerErrorException(this.MESSAGE_PDF_PROCESSING_ERROR, { cause: error });
        }
    }

    private extractTitleFromDocument(filename: string): string | null {
        try {
            const copyIndexRegex = /\s?\(\d+\)/g;
            return filename.replace(copyIndexRegex, '').replace('.pdf', '').trim();
        } catch (error) {
            console.log({ message: this.MESSAGE_EXTRACT_TITLE_ERROR, error });
            return null;
        }
    }

    private extractInvoiceStatusFromDocument(documentText: string): 'PAID' | 'UNPAID' | null {
        try {
            const paidStatusRegex = /NÃO RECEBER - FATURA ARRECADADA/i;
            return paidStatusRegex.test(documentText) ? 'PAID' : 'UNPAID';
        } catch (error) {
            console.log({ message: this.MESSAGE_EXTRACT_STATUS_ERROR, error });
            return null;
        }
    }

    private extractAddressRegex(documentText: string): TAddress {
        try {
            const result: TAddress = { address: null, postalCode: null, neighborhood: null };
            const addressRegex = /Endereço:\s*(.*?)\s*CEP:\s*(\d{5}-\d{3})/is;
            const match = documentText.match(addressRegex);

            if (match && match[1] && match[2]) {
                const rawAddressString = match[1].replace(/\n/g, ' ').trim();
                result.postalCode = match[2];
                const addressParts = rawAddressString.split('-').map((part) => part.trim());

                if (addressParts.length > 1) {
                    result.address = addressParts[0];
                    result.neighborhood = addressParts[addressParts.length - 1];
                } else {
                    result.address = rawAddressString;
                }
            }
            return result;
        } catch (error) {
            console.log({ message: this.MESSAGE_EXTRACT_ADDRESS_ERROR, error });
            return { address: null, postalCode: null, neighborhood: null };
        }
    }

    private extractInvoiceIdFromDocument(documentText: string): string | null {
        try {
            const regex = /(FAT-[\d\.-]+)/;
            const match = documentText.match(regex);
            return match ? match[1] : null;
        } catch (error) {
            console.log({ message: this.MESSAGE_EXTRACT_ID_ERROR, error });
            return null;
        }
    }

    private extractIssuerCnpj(documentText: string): string | null {
        try {
            const cnpjRegex = /CNPJ\s*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/;
            const match = documentText.match(cnpjRegex);
            return match ? match[1] : null;
        } catch (error) {
            console.log({ message: this.MESSAGE_EXTRACT_CNPJ_ERROR, error });
            return null;
        }
    }

    private extractInvoiceExpiresDateFromDocument(documentText: string): Date | null {
        try {
            const regex = /(\d{2}\/\d{4})(\d{2}\/\d{2}\/\d{4})R\$/;
            const match = documentText.match(regex);
            if (!match || !match[2]) return null;
            const expiresInvoiceDate = match[2];
            return new Date(expiresInvoiceDate.split('/').reverse().join('-'));
        } catch (error) {
            console.log({ message: this.MESSAGE_EXTRACT_EXPIRES_DATE_ERROR, error });
            return null;
        }
    }

    private extractInvoiceReferenceMonthFromDocument(documentText: string): Date | null {
        try {
            const regex = /(\d{2}\/\d{4})(\d{2}\/\d{2}\/\d{4})R\$/;
            const match = documentText.match(regex);
            if (!match || !match[1]) return null;
            const invoiceReferenceMonth = match[1];
            return new Date(invoiceReferenceMonth.split('/').reverse().join('-'));
        } catch (error) {
            console.log({ message: this.MESSAGE_EXTRACT_REFERENCE_MONTH_ERROR, error });
            return null;
        }
    }

    private extractMonetaryValueFromDocument(documentText: string): number | null {
        try {
            const totalRegex = /(?:TOTAL\s*R\$\s*([\d\.,]+))|(?:\d{2}\/\d{2}\/\d{4}R\$\s*([\d\.,]+))/i;
            const match = documentText.match(totalRegex);

            const valueMatch = match ? match[1] || match[2] : null;

            if (!valueMatch) {
                return null;
            }

            return this.formatCurrencyToNumber(valueMatch);
        } catch (error) {
            console.log({ message: this.MESSAGE_EXTRACT_MONETARY_VALUE_ERROR, error });
            return null;
        }
    }

    private formatCurrencyToNumber(currencyString: string | null): number | null {
        if (!currencyString) {
            return null;
        }

        try {
            const sanitizedValue = currencyString.trim().replace(/\./g, '').replace(',', '.');

            return parseFloat(sanitizedValue);
        } catch (error) {
            console.error(this.MESSAGE_FORMAT_CURRENCY_ERROR, currencyString, error);

            return null;
        }
    }

    async extractWebSiteData(extractWebSite: TExtractWebSiteData) {
        const data = await this.useNoJavascriptToExtractWebsite(extractWebSite.url);
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
}
