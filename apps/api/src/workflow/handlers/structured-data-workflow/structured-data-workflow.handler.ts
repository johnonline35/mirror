import { Injectable, Logger } from '@nestjs/common';
import { IWorkflowHandler } from '../workflow-handler.interface';
import { TaskDispatcherService } from '../../../task-dispatcher/task-dispatcher.service';
import { ITask } from '../../../interfaces/task.interface';
import { AgentType } from '../../../agents/common/agent-registry';
import { ParsePromptService } from '../../../common/utils/parsing/parse-prompt.service';
import { StructuredDataTaskResponse } from './structured-data-workflow.interface';

@Injectable()
export class StructuredDataWorkflowHandler implements IWorkflowHandler {
  protected readonly logger = new Logger(StructuredDataWorkflowHandler.name);

  constructor(
    private readonly taskDispatcher: TaskDispatcherService,
    private readonly parsePromptService: ParsePromptService,
  ) {}

  async handle(task: ITask): Promise<StructuredDataTaskResponse> {
    try {
      this.logger.log(
        `Handling workflow structured data extraction: ${JSON.stringify(task)}`,
      );

      const promptReview = await this.taskDispatcher.dispatch(
        task,
        AgentType.ValidatePrompt,
      );

      const canCompleteTask =
        this.parsePromptService.parsePromptReview(promptReview);

      if (canCompleteTask.success) {
        this.logger.log('Task can be successfully completed:', task);

        // Crawled data
        // const crawledData = await this.taskDispatcher.dispatch(
        //   task,
        //   AgentType.CrawlHomepage,
        // );

        // // Evaluate relevant links
        // const relevantLinks = await this.taskDispatcher.dispatch(
        //   crawledData,
        //   AgentType.Evaluation,
        // );

        // // Secondary planning
        // const secondaryPlan = await this.taskDispatcher.dispatch(
        //   relevantLinks,
        //   AgentType.Plan,
        // );

        // // Final data extraction
        // const finalData = await this.taskDispatcher.dispatch(
        //   secondaryPlan,
        //   AgentType,
        // );

        // this.logger.log('Successfully processed structured data extraction.');
        return {};
        // return { success: true, finalData };
      } else {
        this.logger.warn(`Feedback: ${canCompleteTask.feedback}`);
        return { success: false, feedback: canCompleteTask.feedback };
      }
    } catch (error) {
      this.logger.error('Error handling structured data extraction:', error);
      throw new Error(`Workflow processing failed: ${error.message}`);
    }
  }
}
