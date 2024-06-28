import { Injectable, Logger } from '@nestjs/common';
import { IWorkflowHandler } from '../workflow-handler.interface';
import { TaskDispatcherService } from '../../../task-dispatcher/task-dispatcher.service';
import { ITask } from '../../../interfaces/task.interface';
import { AgentType } from '../../../agents/common/agent-registry';
import { ParsePromptService } from '../../../common/utils/parsing/parse-prompt.service';
import { StructuredDataTaskResponse } from './structured-data-workflow.interface';
import { UrlExtractorService } from '../../../common/utils/parsing/url-extractor.service';
import { ExtractedPageData } from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';

@Injectable()
export class StructuredDataWorkflowHandler implements IWorkflowHandler {
  protected readonly logger = new Logger(StructuredDataWorkflowHandler.name);

  constructor(
    private readonly taskDispatcher: TaskDispatcherService,
    private readonly parsePromptService: ParsePromptService,
    private readonly urlExtractorService: UrlExtractorService,
  ) {}

  async handle(task: ITask): Promise<StructuredDataTaskResponse> {
    try {
      this.logger.log(
        `Handling workflow structured data extraction: ${JSON.stringify(task)}`,
      );

      const promptReview = await this.taskDispatcher.dispatch(
        task,
        AgentType.ValidatePromptAgent,
      );

      const canCompleteTask =
        this.parsePromptService.parsePromptReview(promptReview);

      if (canCompleteTask.success) {
        this.logger.log('Task can be successfully completed:', task);

        // Get an understanding from the homepage as to the type of site it is, whether it can be crawled and if it can be, the links and assets it has
        const homepageData: ExtractedPageData =
          await this.taskDispatcher.dispatch(
            task,
            AgentType.CrawlHomepageAgent,
          );

        // Given the users goals, generate a list of pages to visit to complete the goal
        const siteCrawlPlan = await this.taskDispatcher.dispatch(
          task,
          AgentType.CrawlSitePlanningAgent,
          homepageData,
        );

        console.log('siteCrawlPlan', siteCrawlPlan);

        const internalLinksToCrawl =
          this.urlExtractorService.extractUrls(siteCrawlPlan);

        console.log('Internal Links to crawl:', internalLinksToCrawl);

        // Crawl the website based on the plan
        // const extractedWebsiteData = await this.taskDispatcher.dispatch(
        //   task,
        //   AgentType.CrawlWebsiteAgent,
        //   internalLinksToCrawl,
        // );

        // Evaluate the extracted data and decide whether it meets the users initial schema, if not, adjust it before returning it in the correct schema
        // const outputEvaluation = await this.taskDispatcher.dispatch(
        //    extractedWebsiteData,
        //    AgentType.OutputEvaluationAgent,
        // );

        // Reflect on how this process has gone - is the result what the user would expect?
        // const result = await this.taskDispatcher.dispatch(
        //    outputEvaluation,
        //    AgentType.ReflectionAgent,
        // );

        return {
          success: true,
          feedback: canCompleteTask.feedback,
          // resultData: homepageData,
          resultData: 'Finished',
        };
        // }
      } else {
        // TODO handle the cannot be crawled use case
        this.logger.warn(`Feedback: ${canCompleteTask.feedback}`);
        return {
          success: false,
          feedback: canCompleteTask.feedback,
          resultData: 'none',
        };
      }
    } catch (error) {
      this.logger.error('Error handling structured data extraction:', error);
      throw new Error(`Workflow processing failed: ${error.message}`);
    }
  }
}
