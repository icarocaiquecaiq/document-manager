import { Injectable } from '@nestjs/common';
import { IDocumentParser } from './document-parser.interface';
import * as cheerio from 'cheerio';
import { Cheerio } from 'cheerio';
import { IScrapedData } from '../invoice.types';

type TWebExtractionRule = {
    fieldName: keyof IScrapedData;
    selector: string;
    formatter: (element: Cheerio<any>, $: cheerio.CheerioAPI) => any;
};

@Injectable()
export class MercadoLivreParser implements IDocumentParser {
    private readonly rules: TWebExtractionRule[] = [
        {
            fieldName: 'title',
            selector: 'h1.bf-ui-context-with-ellipsis__title',
            formatter: (element) => element.text().trim(),
        },
        {
            fieldName: 'monetaryValue',
            selector: '#total_row_7f93d52f92a9 .bf-ui-price-small',
            formatter: (element) => {
                const integerPart = element.first().text().trim();
                const centsPart = element.siblings('.bf-ui-price-small-cents').text().trim();
                return this.formatCurrencyToNumber(`${integerPart},${centsPart}`);
            },
        },
        {
            fieldName: 'invoiceId',
            selector: '.bf-ui-ticket__subtitle',
            formatter: (element) => element.text().match(/#\s*(\d+)/)?.[1] || null,
        },
        {
            fieldName: 'invoiceStatus',
            selector: '.feedback-container-intro__text-container .bf-ui-rich-text--success',
            formatter: (element) => (element.text().trim().toLowerCase() === 'entregue' ? 'PAID' : 'UNPAID'),
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
                console.log({ message: `Error extracting Mercado Livre field: ${String(rule.fieldName)}`, error });
            }
        }
        return extractedData;
    }
    private formatCurrencyToNumber(currencyString: string | null): number | null {
        if (!currencyString) return null;
        const sanitizedValue = currencyString.trim().replace(/\./g, '').replace(',', '.');
        return parseFloat(sanitizedValue);
    }
}
