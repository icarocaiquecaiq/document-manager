import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDTO } from './dto/input/create-client.dto';

@Controller('clients')
export class ClientController {
    constructor(private readonly clientService: ClientService) {}

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    createClient(
        @Body()
        clientData: CreateClientDTO,
    ) {
        return this.clientService.addClient(clientData);
    }
}
