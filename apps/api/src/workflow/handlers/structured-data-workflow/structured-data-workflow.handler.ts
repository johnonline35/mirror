import { Injectable, Logger } from '@nestjs/common';
import { IWorkflowHandler } from '../workflow-handler.interface';
import { TaskDispatcherService } from '../../../task-dispatcher/task-dispatcher.service';
import { ITask } from '../../../interfaces/task.interface';
import { AgentType } from '../../../agents/common/agent-registry';
import { ParsePromptService } from '../../../common/utils/parsing/parse-prompt.service';
import { StructuredDataTaskResponse } from './structured-data-workflow.interface';
import { UrlExtractorService } from '../../../common/utils/parsing/url-extractor.service';
import {
  ExtractedPageData,
  ProcessedPagesData,
} from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';
import { ConcurrentPageDataService } from '../../../common/utils/concurrency/concurrency-handler.service';
import { JsonExtractionService } from '../../../common/utils/json-extraction-from-text/json-extraction.service';

@Injectable()
export class StructuredDataWorkflowHandler implements IWorkflowHandler {
  protected readonly logger = new Logger(StructuredDataWorkflowHandler.name);

  constructor(
    private readonly taskDispatcher: TaskDispatcherService,
    private readonly parsePromptService: ParsePromptService,
    private readonly urlExtractorService: UrlExtractorService,
    private readonly concurrentPageDataService: ConcurrentPageDataService,
    private readonly jsonExtractionService: JsonExtractionService,
  ) {}

  async handle(task: ITask): Promise<StructuredDataTaskResponse> {
    try {
      this.logger.log(
        `Handling workflow structured data extraction: ${JSON.stringify(task)}`,
      );

      // Review the user's initial task to determine if the task can be completed
      const promptReview = await this.taskDispatcher.dispatch(
        task,
        AgentType.ValidatePromptAgent,
      );

      const canCompleteTask =
        this.parsePromptService.parsePromptReview(promptReview);

      if (canCompleteTask.success) {
        this.logger.log(
          'Task can be successfully completed:',
          JSON.stringify(task),
        );

        // Extract all data from the homepage into ExtractedPageData object
        const homepageData: ExtractedPageData =
          await this.taskDispatcher.dispatch(task, AgentType.CrawlPageAgent);

        // Given the users task, generate a list of pages to visit to complete the task
        const siteCrawlPlan = await this.taskDispatcher.dispatch(
          task,
          AgentType.CrawlSitePlanningAgent,
          homepageData,
        );

        console.log('siteCrawlPlan', siteCrawlPlan);

        const urls = this.urlExtractorService.extractUrls(siteCrawlPlan.plan);

        console.log('urls', urls);

        // Extract data from each url/page
        const extractedPagesData: ExtractedPageData[] =
          await this.executeAgentConcurrently<string, ExtractedPageData>(
            urls.slice(0, 5),
            // urls,
            task,
            AgentType.CrawlPageAgent,
            5, // concurrency limit
          );

        // Concatenate the homepageData into extractedPagesData
        extractedPagesData.unshift(homepageData);

        console.log('extractedPagesData:');
        extractedPagesData.forEach((data, index) => {
          console.log(`Result ${index + 1}:`, data);
        });

        const llmProcessedPagesData: ProcessedPagesData[] =
          await this.executeAgentConcurrently<
            ExtractedPageData,
            ProcessedPagesData
          >(
            extractedPagesData,
            task,
            AgentType.DataExtractionAndInferenceAgent,
            5, // concurrency limit
          );

        llmProcessedPagesData.forEach((data, index) => {
          console.log(`processedPagesData object ${index + 1}:`, data);
        });

        const llmFinalExtractedAndProcessedData: string =
          await this.taskDispatcher.dispatch(
            task,
            AgentType.DataReviewAgent,
            llmProcessedPagesData,
          );

        console.log('processedData:', llmFinalExtractedAndProcessedData);

        const resultJson = this.jsonExtractionService.extractValidJson(
          llmFinalExtractedAndProcessedData,
        );

        console.log(
          '************final json************',
          JSON.stringify(resultJson),
        );

        // TODO: output data to s3 bucket
        // pre signed url?

        return {
          success: true,
          feedback: canCompleteTask.feedback,
          // resultData: homepageData,
          resultData: resultJson,
        };
      } else {
        this.logger.warn(`Feedback: ${canCompleteTask.feedback}`);
        return {
          success: false,
          feedback: canCompleteTask.feedback,
          resultData: [],
        };
      }
    } catch (error) {
      this.logger.error('Error handling structured data extraction:', error);
      throw new Error(`Workflow processing failed: ${error.message}`);
    }
  }

  private async executeAgentConcurrently<TInput, TOutput>(
    inputs: TInput[],
    task: ITask,
    agentType: AgentType,
    concurrencyLimit: number,
  ): Promise<TOutput[]> {
    const taskFn = (input: TInput): Promise<TOutput> =>
      this.taskDispatcher.dispatch(task, agentType, input) as Promise<TOutput>;

    return this.concurrentPageDataService.execute(
      inputs,
      concurrencyLimit,
      taskFn,
    );
  }
}
