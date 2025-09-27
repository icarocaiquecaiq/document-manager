import { Injectable } from '@nestjs/common';
import { IDocumentParser } from './document-parser.interface';

import * as cheerio from 'cheerio';

@Injectable()
export class WebDocumentParser implements IDocumentParser {
    // Regras com Seletores CSS
    private rules = [
        /* ... Suas regras com Seletores CSS ... */
    ];

    parse(htmlContent: string) {
        const extractedData = {};
        const $ = cheerio.load(htmlContent);
        // ... Lógica que itera sobre as regras e preenche o extractedData ...
        console.log('Web Parser executed');
        return extractedData;
    }
}
