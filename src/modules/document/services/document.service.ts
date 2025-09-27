import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DocumentService {
    constructor(private readonly prisma: PrismaService) {}

    async getDocumentById(id: number) {
        return id;
    }
}
