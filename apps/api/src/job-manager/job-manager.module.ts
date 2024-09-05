import { Module } from '@nestjs/common';
import { JobManagerService } from './job-manager.service';
import { PrismaService } from '../common/services/prisma/prisma.service';
import { WorkflowModule } from '../workflow/workflow.module';
import { ServicesModule } from '../common/services/services.module';

@Module({
  imports: [WorkflowModule, ServicesModule],
  providers: [JobManagerService, PrismaService],
  exports: [JobManagerService],
})
export class JobManagerModule {}
