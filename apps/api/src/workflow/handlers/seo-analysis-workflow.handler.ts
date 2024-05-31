import { Injectable, Logger } from '@nestjs/common';
import { IWorkflowHandler } from '../../interfaces/workflow-handler.interface';
import { TaskDispatcherService } from '../../task-dispatcher/task-dispatcher.service';
import { ITask } from '../../interfaces/task.interface';

@Injectable()
export class SEOAnalysisWorkflowHandler implements IWorkflowHandler {
  private readonly logger = new Logger(SEOAnalysisWorkflowHandler.name);

  constructor(private readonly taskDispatcher: TaskDispatcherService) {}

  async handle(prompt: ITask) {
    try {
      this.logger.log('Handling SEO analysis prompt:', prompt);
      // Implement the SEO analysis workflow logic
      const initialPlan = await this.taskDispatcher.dispatch(prompt);

      // Continue with other steps as needed

      return finalData;
    } catch (error) {
      this.logger.error('Error handling SEO analysis prompt:', error);
      throw new Error(`Workflow processing failed: ${error.message}`);
    }
  }
}
