import { Module } from '@nestjs/common';
import { AgentsModule } from '../agents/agents.module';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [AgentsModule],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
