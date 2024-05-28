import { Module } from '@nestjs/common';
import { AgentsModule } from '../agents/agents.module';
import { AgentWorkflowsService } from './agent-workflows/agent-workflows.service';

@Module({
  imports: [AgentsModule],
  providers: [WorkflowManager, AgentWorkflowsService],
  exports: [WorkflowManager],
})
export class WorkflowsModule {}
