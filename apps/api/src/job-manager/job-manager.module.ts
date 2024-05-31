import { Module } from '@nestjs/common';
import { JobManagerService } from './job-manager.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [JobManagerService, PrismaService],
  exports: [JobManagerService],
})
export class JobManagerModule {}
