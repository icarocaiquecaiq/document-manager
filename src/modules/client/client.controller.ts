import { Body, Controller, Delete, Get, HttpCode, Param, ParseBoolPipe, ParseIntPipe, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDTO } from './dto/input/create-client.dto';
import { UpdateClientDTO } from './dto/input/update-client.dto';

@Controller('client')
export class ClientController {
    constructor(private readonly clientService: ClientService) {}

    @Get('get-all')
    @UsePipes(new ValidationPipe({ transform: true }))
    getAllClients(
        @Query('withInvoiceCount', new ParseBoolPipe({ optional: true }))
        withInvoiceCount?: boolean,
    ) {
        return this.clientService.getAllClients(!!withInvoiceCount);
    }

    @Get(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    getClientById(@Param('id', ParseIntPipe) id: number) {
        return this.clientService.getClientById(id);
    }

    @Post()
    @HttpCode(201)
    @UsePipes(new ValidationPipe({ transform: true }))
    createClient(
        @Body()
        clientData: CreateClientDTO,
    ) {
        return this.clientService.addClient(clientData);
    }

    @Put()
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true }))
    updateClient(
        @Body()
        clientData: UpdateClientDTO,
        @Query('email') email: string,
    ) {
        return this.clientService.updateClient(email, clientData);
    }

    @Delete(':id')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ transform: true }))
    deleteClient(@Param('id', ParseIntPipe) id: number) {
        return this.clientService.deleteClient(id);
    }
}
