import { Module } from '@nestjs/common';
import { ClientService } from './client/client.service';
import { AuthService } from './auth/auth.service';
import { ClientController } from './client/client.controller';
import { S3ManagerModule } from './s3-manager/s3-manager.module';

@Module({
  imports: [S3ManagerModule],
  controllers: [ClientController],
  providers: [AuthService, ClientService],
  exports: [AuthService, ClientService, S3ManagerModule],
})
export class ServicesModule {}
