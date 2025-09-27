import { BadRequestException, HttpCode, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TClient } from './client-types';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

@Injectable()
export class ClientService {
    constructor(private readonly prisma: PrismaService) {}

    private readonly MESSAGE_CLIENT_NOT_FOUND = 'Client not found';
    private readonly MESSAGE_CLIENT_GET_ALL_ERROR = 'Error fetching clients';
    private readonly MESSAGE_CLIENT_GET_BY_ID_ERROR = 'Error fetching client by ID';
    private readonly MESSAGE_CLIENT_ALREADY_EXISTS = 'Client already exists';
    private readonly MESSAGE_CLIENT_ADD_ERROR = 'Error adding client';
    private readonly MESSAGE_CLIENT_UPDATE_ERROR = 'Error updating client';
    private readonly MESSAGE_CLIENT_DELETE_ERROR = 'Error deleting client';

    async getAllClients() {
        try {
            const clients = await this.prisma.client.findMany();

            if (!clients) {
                throw new NotFoundException(this.MESSAGE_CLIENT_NOT_FOUND);
            }

            return clients;
        } catch (e) {
            throw new InternalServerErrorException(this.MESSAGE_CLIENT_GET_ALL_ERROR, 'error: ' + e);
        }
    }

    async getClientById(id: number) {
        try {
            const client = await this.prisma.client.findUnique({ where: { id } });

            if (!client) {
                throw new NotFoundException(this.MESSAGE_CLIENT_NOT_FOUND);
            }

            return client;
        } catch (e) {
            throw new InternalServerErrorException(this.MESSAGE_CLIENT_GET_BY_ID_ERROR, 'error: ' + e);
        }
    }

    async addClient(ClientData: TClient) {
        try {
            const addedClient = await this.prisma.client.create({ data: ClientData });

            return addedClient;
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    throw new BadRequestException(this.MESSAGE_CLIENT_ALREADY_EXISTS);
                }
            }

            throw new InternalServerErrorException(this.MESSAGE_CLIENT_ADD_ERROR, 'error: ' + e);
        }
    }

    async updateClient(email: string, ClientData: TClient) {
        try {
            const updatedClient = await this.prisma.client.update({ where: { email }, data: ClientData });

            return updatedClient;
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    throw new BadRequestException(this.MESSAGE_CLIENT_ALREADY_EXISTS);
                }

                if (e.code === 'P2025') {
                    throw new NotFoundException(this.MESSAGE_CLIENT_NOT_FOUND);
                }
            }

            throw new InternalServerErrorException(this.MESSAGE_CLIENT_UPDATE_ERROR, 'error: ' + e);
        }
    }

    async deleteClient(id: number) {
        try {
            const deletedClient = await this.prisma.client.delete({ where: { id } });

            return deletedClient;
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
                if (e.code === 'P2025') {
                    throw new NotFoundException(this.MESSAGE_CLIENT_NOT_FOUND);
                }
            }

            throw new InternalServerErrorException(this.MESSAGE_CLIENT_DELETE_ERROR, 'error: ' + e);
        }
    }
}
