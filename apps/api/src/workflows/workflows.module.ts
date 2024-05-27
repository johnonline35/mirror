import { Module } from '@nestjs/common';
import { WorkflowManager } from './workflow-manager/workflow-manager.service';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [AgentsModule],
  providers: [WorkflowManager],
  exports: [WorkflowManager],
})
export class WorkflowsModule {}
