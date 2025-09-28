import { Module } from '@nestjs/common';
import { ClientModule } from './modules/client/client.module';
import { PrismaModule } from './prisma/prisma.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
@Module({
    imports: [ClientModule, PrismaModule, InvoiceModule],
    providers: [],
})
export class AppModule {}
