import { Module } from '@nestjs/common';
import { JobManagerService } from './job-manager.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [WorkflowModule],
  providers: [JobManagerService, PrismaService],
  exports: [JobManagerService],
})
export class JobManagerModule {}
