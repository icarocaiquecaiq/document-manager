import { Injectable } from '@nestjs/common';
import pdf from 'pdf-parse';
import axios from 'axios';
import { PdfDocumentParser } from '../parses/pdf-document.parser';
import { WebDocumentParser } from '../parses/website-document-parser';

@Injectable()
export class ScrapingService {
    constructor(
        private readonly pdfParser: PdfDocumentParser,
        private readonly webParser: WebDocumentParser,
    ) {}

    async scrapeFromPdf(fileBuffer: Buffer) {
        const data = await pdf(fileBuffer);
        return this.pdfParser.parse(data.text);
    }

    async scrapeFromWeb(url: string) {
        const response = await axios.get(url);
        return this.webParser.parse(response.data);
    }
}
