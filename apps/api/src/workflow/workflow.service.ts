import { Injectable, Logger } from '@nestjs/common';
import { WorkflowFactory } from './workflow.factory';
import { ITask } from '../interfaces/task.interface';

@Injectable()
export class WorkflowService {
  protected readonly logger = new Logger(WorkflowService.name);

  constructor(private readonly workflowFactory: WorkflowFactory) {}

  async handle(task: ITask) {
    try {
      this.logger.log('Handling task:', task);
      const handler = this.workflowFactory.getWorkflowHandler(task);
      const result = await handler.handle(task);
      this.logger.log('Successfully processed task.');
      return result;
    } catch (error) {
      this.logger.error('Error handling task:', error);
      throw new Error(`Workflow processing failed: ${error.message}`);
    }
  }
}
