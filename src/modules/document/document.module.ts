import { Module } from '@nestjs/common';
import { DocumentController } from './controllers/document.controller';
import { DocumentScraplingService } from './services/document-scrapling.service';
import { DocumentService } from './services/document.service';
import { DocumentScraplingController } from './controllers/document-scrapling.controller';

@Module({
    imports: [],
    controllers: [DocumentController, DocumentScraplingController],
    providers: [DocumentScraplingService, DocumentService],
    exports: [DocumentScraplingService, DocumentService],
})
export class DocumentModule {}
