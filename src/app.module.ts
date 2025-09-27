import { Module } from '@nestjs/common';
import { ClientModule } from './modules/clients/client.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { DocumentModule } from './modules/document/document.module';

@Module({
    imports: [AuthModule, ClientModule, PrismaModule, DocumentModule],
    providers: [],
})
export class AppModule {}
