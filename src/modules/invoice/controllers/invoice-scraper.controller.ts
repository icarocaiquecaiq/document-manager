import { Body, Controller, HttpStatus, Param, ParseFilePipeBuilder, ParseIntPipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WebsiteInvoiceScraperDTO } from '../dto/input/website-invoice-scraper.dto';
import { InvoiceScraperService } from '../services/invoice-scraper.service';

@Controller('invoice')
export class InvoiceScraperController {
    constructor(private readonly invoiceScraperService: InvoiceScraperService) {}

    @Post('client/:id/website')
    async addScrapedWebSiteToClient(@Body() websiteInvoiceScraper: WebsiteInvoiceScraperDTO, @Param('id', ParseIntPipe) id: number) {
        return this.invoiceScraperService.scrapWebSiteData({ clientId: id, url: websiteInvoiceScraper.url });
    }

    @Post('client/:id/pdf')
    @UseInterceptors(FileInterceptor('file'))
    addScrapedPdfToClient(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({ fileType: 'pdf' })
                .addMaxSizeValidator({ maxSize: 1024 * 1024 * 2 }) // 2MB
                .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
        )
        file: Express.Multer.File,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.invoiceScraperService.scrapPdfData({ clientId: id, file });
    }
}
