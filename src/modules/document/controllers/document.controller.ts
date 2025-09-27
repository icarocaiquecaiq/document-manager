import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { DocumentService } from '../services/document.service';

@Controller('document')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}

    @Get(':id')
    async getDocumentById(@Param('id', ParseIntPipe) id: number) {
        return this.documentService.getDocumentById(id);
    }
}
