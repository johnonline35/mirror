import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  extractClientIdFromHeader(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Invalid authorization header format');
    }
    const base64Credentials = authHeader.split(' ')[1];

    // Decode base64 credentials
    let credentials: string;
    try {
      credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid base64 encoding in authorization header',
      );
    }

    // Extract clientId from decoded credentials
    const [clientId] = credentials.split(':');

    if (!clientId) {
      throw new UnauthorizedException(
        'Missing clientId in authorization header',
      );
    }

    return clientId;
  }
}
