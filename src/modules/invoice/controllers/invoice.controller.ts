import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InvoiceService } from '../services/invoice.service';

@Controller('invoice')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) {}

    @Get(':id')
    async getInvoiceById(@Param('id', ParseIntPipe) id: number) {
        return this.invoiceService.getInvoiceById(id);
    }

    @Get('client/:clientId')
    async getInvoicesByClientId(@Param('clientId', ParseIntPipe) clientId: number) {
        return this.invoiceService.getInvoicesByClientId(clientId);
    }
}
