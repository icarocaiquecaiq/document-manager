import { Module } from '@nestjs/common';
import { ClientModule } from './modules/clients/client.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [AuthModule, ClientModule, PrismaModule],
    providers: [],
})
export class AppModule {}
