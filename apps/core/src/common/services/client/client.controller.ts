import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dtos/create-client.dto';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createClient(@Body() createClientDto: CreateClientDto) {
    const { clientId, clientSecret } = createClientDto;

    const client = await this.clientService.createClient(
      clientId,
      clientSecret,
    );

    return { message: 'Client created successfully', client };
  }

  // TODO: update, delete, get client details
}
