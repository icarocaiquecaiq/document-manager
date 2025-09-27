import { Injectable } from '@nestjs/common';
import { IDocumentParser } from './document-parser.interface';
import { IScrapedData, IScrapedPdfData } from '../invoice.types';

type TExtractionRule = {
    fieldName: keyof IScrapedPdfData;
    patterns: RegExp[];
    formatter: (match: RegExpMatchArray) => any;
    errorMessage: string;
};

@Injectable()
export class PdfDocumentParser implements IDocumentParser {
    private readonly rules: TExtractionRule[] = [
        {
            fieldName: 'monetaryValue',
            patterns: [/(?:TOTAL A PAGAR\s*R\$\s*([\d\.,]+))|(?:\d{2}\/\d{2}\/\d{4}R\$\s*([\d\.,]+))/i],
            formatter: (match) => this.formatCurrencyToNumber(match[1] || match[2]),
            errorMessage: 'Error extracting monetary value',
        },
        {
            fieldName: 'invoiceExpiresDate',
            patterns: [/VENCIMENTO\s*(\d{2}\/\d{2}\/\d{4})/i, /(\d{2}\/\d{4})(\d{2}\/\d{2}\/\d{4})R\$/],
            formatter: (match) => new Date((match[1] || match[2]).split('/').reverse().join('-')),
            errorMessage: 'Error extracting expires date',
        },
        {
            fieldName: 'invoiceReferenceMonth',
            patterns: [/(\d{2}\/\d{4})(\d{2}\/\d{2}\/\d{4})R\$/],
            formatter: (match) => new Date(match[1].split('/').reverse().join('-')),
            errorMessage: 'Error extracting reference month',
        },
        {
            fieldName: 'issuerCnpj',
            patterns: [/CNPJ\s*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/],
            formatter: (match) => match[1],
            errorMessage: 'Error extracting CNPJ',
        },
        {
            fieldName: 'invoiceId',
            patterns: [/(FAT-[\d\.-]+)/],
            formatter: (match) => match[1],
            errorMessage: 'Error extracting invoice ID',
        },
        {
            fieldName: 'postalCode',
            patterns: [/CEP:\s*(\d{5}-\d{3})/i],
            formatter: (match) => match[1],
            errorMessage: 'Error extracting postal code',
        },
        {
            fieldName: 'address',
            patterns: [/Endereço:\s*(.*?)\s*-/is],
            formatter: (match) => match[1].replace(/\n/g, ' ').trim(),
            errorMessage: 'Error extracting address',
        },
        {
            fieldName: 'neighborhood',
            patterns: [/Endereço:\s*(.*?)\s*CEP:/is],
            formatter: (match) => {
                const parts = match[1].split('-');
                const part = parts.length > 1 ? parts.pop() : null;
                return part ? part.trim() : null;
            },
            errorMessage: 'Error extracting neighborhood',
        },
    ];

    public parse(textContent: string): Partial<IScrapedData> {
        const extractedData: Partial<IScrapedData> = {};

        for (const rule of this.rules) {
            try {
                const match = this.findMatch(textContent, rule.patterns);
                if (match) {
                    extractedData[rule.fieldName] = rule.formatter(match);
                }
            } catch (error) {
                console.log({
                    message: rule.errorMessage,
                    field: rule.fieldName,
                    error,
                });
            }
        }

        if (/NÃO RECEBER - FATURA ARRECADADA/i.test(textContent)) {
            extractedData.invoiceStatus = 'PAID';
        } else {
            extractedData.invoiceStatus = null;
        }

        return extractedData;
    }

    private findMatch(text: string, patterns: RegExp[]): RegExpMatchArray | null {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match;
        }
        return null;
    }

    private formatCurrencyToNumber(currencyString: string | null): number | null {
        if (!currencyString) return null;
        const sanitizedValue = currencyString.trim().replace(/\./g, '').replace(',', '.');
        return parseFloat(sanitizedValue);
    }
}
