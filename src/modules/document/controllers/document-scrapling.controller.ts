import { Body, Controller, HttpStatus, Param, ParseFilePipeBuilder, ParseIntPipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { DocumentScraplingService } from '../services/document-scrapling.service';
import { extractWebSiteDataDTO } from '../dto/input/extract-website-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('document')
export class DocumentScraplingController {
    constructor(private readonly documentService: DocumentScraplingService) {}

    @Post('client/:id/website')
    async addScrapedWebSiteToClient(@Body() extractWebSite: extractWebSiteDataDTO) {
        return this.documentService.extractWebSiteData(extractWebSite);
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
        return this.documentService.extractPdfData(id, file);
    }
}
