import { Module } from '@nestjs/common';
import { ClientService } from './client/client.service';
import { AuthService } from './auth/auth.service';
import { ClientController } from './client/client.controller';
import { AWSModule } from './aws/aws.module';

@Module({
  imports: [AWSModule],
  controllers: [ClientController],
  providers: [AuthService, ClientService],
  exports: [AuthService, ClientService, AWSModule],
})
export class ServicesModule {}
