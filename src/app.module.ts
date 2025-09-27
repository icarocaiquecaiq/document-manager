import { Module } from '@nestjs/common';
import { ClientModule } from './modules/client/client.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
@Module({
    imports: [AuthModule, ClientModule, PrismaModule, InvoiceModule],
    providers: [],
})
export class AppModule {}
