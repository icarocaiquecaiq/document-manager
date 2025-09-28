import { Injectable } from '@nestjs/common';
import { IDocumentParser } from './document-parser.interface';
import { Cheerio } from 'cheerio';
import * as cheerio from 'cheerio';
import { IScrapedData } from '../invoice.types';
import { cleanText, formatCurrencyToNumberWithSymbol, formatDate } from '../utils/parsing.helpers';

type TWebExtractionRule = {
    fieldName: keyof IScrapedData;
    selector: string;
    formatter: (element: Cheerio<any>, $: cheerio.CheerioAPI) => any;
};

@Injectable()
export class AsaasParser implements IDocumentParser {
    private readonly rules: TWebExtractionRule[] = [
        {
            fieldName: 'title',
            selector: 'title',
            formatter: (element) => element.text().trim(),
        },
        {
            fieldName: 'monetaryValue',
            selector: 'div.control-group:contains("Valor pago:")',
            formatter: (element) => formatCurrencyToNumberWithSymbol(element.text()),
        },
        {
            fieldName: 'invoiceExpiresDate',
            selector: 'label:contains("Data do vencimento:")',
            formatter: (element) => formatDate(element.parent().text()),
        },
        {
            fieldName: 'paidInvoiceDate',
            selector: 'label:contains("Data do pagamento:")',
            formatter: (element) => formatDate(element.parent().text()),
        },
        {
            fieldName: 'issuerCnpj',
            selector: 'label:contains("Dados do recebedor")',
            formatter: (element, $) => {
                const cnpjText = element.parent().nextAll('div:has(label:contains("CPF/CNPJ"))').first().text();
                return cleanText(cnpjText);
            },
        },
        {
            fieldName: 'invoiceId',
            selector: 'label:contains("ID/Transação Pix:")',
            formatter: (element) => cleanText(element.parent().text()),
        },
        {
            fieldName: 'invoiceStatus',
            selector: 'div[data-testid="e2e-transaction-receipt-header-title"]',
            formatter: (element) => (element.text().includes('Comprovante de pagamento') ? 'PAID' : 'UNPAID'),
        },
    ];

    public parse(htmlContent: string): Partial<IScrapedData> {
        const extractedData: Partial<IScrapedData> = {};
        const $ = cheerio.load(htmlContent);

        for (const rule of this.rules) {
            try {
                const element = $(rule.selector);
                if (element && element.length > 0) {
                    extractedData[rule.fieldName] = rule.formatter(element, $);
                }
            } catch (error) {
                console.log({ message: `Error extracting web field: ${String(rule.fieldName)}`, error });
            }
        }
        return extractedData;
    }
}
