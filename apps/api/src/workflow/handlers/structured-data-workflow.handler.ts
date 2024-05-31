// src/workflow/handlers/structured-data-workflow.handler.ts
import { Injectable, Logger } from '@nestjs/common';
import { IWorkflowHandler } from '../../interfaces/workflow-handler.interface';
import { TaskDispatcherService } from '../../task-dispatcher/task-dispatcher.service';
import { ITask } from '../../interfaces/task.interface';
import { AgentType } from '../../agents/agent-types.enum';

@Injectable()
export class StructuredDataWorkflowHandler implements IWorkflowHandler {
  protected readonly logger = new Logger(StructuredDataWorkflowHandler.name);

  constructor(private readonly taskDispatcher: TaskDispatcherService) {}

  async handle(task: ITask) {
    try {
      this.logger.log(
        `Handling workflow structured data extraction: ${JSON.stringify(task)}`,
      );

      const validatePrompt = await this.taskDispatcher.dispatch(
        task,
        AgentType.ReviewPrompt,
      );
      if (validatePrompt.feedback) {
        this.logger.warn('Invalid prompt:', validatePrompt.feedback);
        return validatePrompt;
      }

      // Crawled data
      const crawledData = await this.taskDispatcher.dispatch(
        detailedPlan,
        AgentType.CrawlHomepage,
      );

      // Evaluate relevant links
      const relevantLinks = await this.taskDispatcher.dispatch(
        crawledData,
        AgentType.Evaluation,
      );

      // Secondary planning
      const secondaryPlan = await this.taskDispatcher.dispatch(
        relevantLinks,
        AgentType.Plan,
      );

      // Final data extraction
      const finalData = await this.taskDispatcher.dispatch(
        secondaryPlan,
        AgentType.CrawlHomepage,
      );

      this.logger.log('Successfully processed structured data extraction.');
      return finalData;
    } catch (error) {
      this.logger.error('Error handling structured data extraction:', error);
      throw new Error(`Workflow processing failed: ${error.message}`);
    }
  }
}
