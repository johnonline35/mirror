import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ClientService } from '../services/client/client.service';

@Injectable()
export class ClientAuthGuard implements CanActivate {
  constructor(private readonly clientService: ClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      console.error('Missing or invalid authorization header.');
      throw new UnauthorizedException('Invalid authorization header');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii',
    );
    const [clientId, clientSecret] = credentials.split(':');

    if (!clientId || !clientSecret) {
      console.error(
        'Missing clientId or clientSecret in the authorization header.',
      );
      throw new UnauthorizedException('Invalid client credentials');
    }

    const isValid = await this.clientService.validateClient(
      clientId,
      clientSecret,
    );
    if (!isValid) {
      console.error(`Authentication failed for client ID ${clientId}.`);
      throw new UnauthorizedException('Invalid client credentials');
    }

    return true;
  }
}
