import { Module } from '@nestjs/common';
import { WorkersModule } from '../workers/workers.module';
import { WorkflowService } from './workflow.service';
import { TaskDispatcherModule } from '../task-dispatcher/task-dispatcher.module';
import { WorkflowFactory } from './workflow.factory';
import { StructuredDataWorkflowHandler } from './handlers/structured-data-workflow/structured-data-workflow.handler';

@Module({
  imports: [WorkersModule, TaskDispatcherModule],
  providers: [WorkflowService, WorkflowFactory, StructuredDataWorkflowHandler],
  exports: [WorkflowService],
})
export class WorkflowModule {}
