import { Injectable } from '@nestjs/common';
import { TClient } from './client-types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientService {
    constructor(private readonly prisma: PrismaService) {}

    addClient(ClientData: TClient) {
        return this.prisma.client.create({ data: ClientData });
    }
}
