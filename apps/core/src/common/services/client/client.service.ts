import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ClientService {
  private readonly saltRounds = 12;

  constructor(private readonly prisma: PrismaService) {}

  async createClient(clientId: string, clientSecret: string) {
    const hashedSecret = await bcrypt.hash(clientSecret, this.saltRounds);
    return this.prisma.client.create({
      data: {
        clientId,
        clientSecret: hashedSecret,
      },
    });
  }

  async validateClient(
    clientId: string,
    clientSecret: string,
  ): Promise<boolean> {
    const client = await this.prisma.client.findUnique({
      where: { clientId },
    });

    if (!client) {
      console.error(`Client with ID ${clientId} not found.`);
      return false;
    }

    const isMatch = await bcrypt.compare(clientSecret, client.clientSecret);
    if (isMatch) {
      // Update lastLogin timestamp
      await this.prisma.client.update({
        where: { clientId },
        data: { lastLogin: new Date() },
      });
    } else {
      console.error(`Invalid client secret for client ID ${clientId}.`);
    }

    return isMatch;
  }

  async findClientById(clientId: string): Promise<Client | null> {
    return this.prisma.client.findUnique({
      where: { clientId },
    });
  }
}
