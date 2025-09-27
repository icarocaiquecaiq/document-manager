import { Module } from '@nestjs/common';
import { InvoiceController } from './controllers/invoice.controller';
import { InvoiceScraperService } from './services/invoice-scraper.service';
import { InvoiceScraperController } from './controllers/invoice-scraper.controller';
import { InvoiceService } from './services/invoice.service';
import { ScrapingService } from './services/scraping.service';
import { PdfDocumentParser } from './parses/pdf-document.parser';
import { WebDocumentParser } from './parses/website-document-parser';

@Module({
    imports: [],
    controllers: [InvoiceController, InvoiceScraperController],
    providers: [InvoiceService, InvoiceScraperService, ScrapingService, PdfDocumentParser, WebDocumentParser],
    exports: [InvoiceService, InvoiceScraperService],
})
export class InvoiceModule {}
