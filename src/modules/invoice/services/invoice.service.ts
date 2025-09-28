import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InvoiceService {
    constructor(private readonly prisma: PrismaService) {}

    private readonly MESSAGE_DOCUMENT_NO_CLIENT = 'Invoice not found';
    private readonly MESSAGE_CLIENT_NOT_FOUND = 'Client not found';

    async getInvoiceById(id: number) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id } });
        if (!invoice) {
            throw new NotFoundException(this.MESSAGE_DOCUMENT_NO_CLIENT);
        }
        return invoice;
    }

    async getInvoicesByClientId(clientId: number) {
        const clientExists = await this.prisma.client.findUnique({ where: { id: clientId } });
        if (!clientExists) {
            throw new NotFoundException(this.MESSAGE_CLIENT_NOT_FOUND);
        }

        const invoices = await this.prisma.invoice.findMany({
            where: {
                clientId: clientId,
            },
        });

        return invoices;
    }
}
