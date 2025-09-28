import { BadRequestException, Injectable } from '@nestjs/common';
import pdf from 'pdf-parse';
import { PdfDocumentParser } from '../parses/pdf-document.parser';
import {} from '../parses/asaas-parser';
import { localTestUrlMap } from '../const/mapped-domains';
import * as cheerio from 'cheerio';
import apiClientHttp from 'src/utils/api';
import { ParserFactory } from '../parses/parser-factory';

@Injectable()
export class ScrapingService {
    constructor(
        private readonly pdfParser: PdfDocumentParser,
        private readonly parserFactory: ParserFactory,
    ) {}

    async scrapeFromPdf(fileBuffer: Buffer) {
        const data = await pdf(fileBuffer);
        return this.pdfParser.parse(data.text);
    }

    async scrapeFromWeb(targetUrl: string) {
        let urlToFetch = targetUrl;
        const domain = new URL(targetUrl).hostname;

        if (!Object.keys(localTestUrlMap).includes(domain)) {
            throw new BadRequestException(`Domain '${domain}' is not supported.`);
        }

        console.log(localTestUrlMap[domain]);
        if (process.env.ENVIROMENT === 'dev' && localTestUrlMap[domain]) {
            console.log(`[TEST MODE] Rerouting ${targetUrl} to ${localTestUrlMap[domain]}`);
            urlToFetch = localTestUrlMap[domain];
        }

        const parser = this.parserFactory.getParserForDomain(domain);

        console.log(`Fetching content from: ${urlToFetch}`);
        const response = await apiClientHttp.get(urlToFetch);

        return parser.parse(response.data);
    }
}
