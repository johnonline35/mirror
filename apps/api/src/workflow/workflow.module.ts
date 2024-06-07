import { Module } from '@nestjs/common';
import { AgentsModule } from '../agents/agents.module';
import { WorkflowService } from './workflow.service';
import { TaskDispatcherService } from '../task-dispatcher/task-dispatcher.service';

@Module({
  imports: [AgentsModule, TaskDispatcherService],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
