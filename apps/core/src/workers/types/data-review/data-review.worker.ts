import { Injectable, Logger } from '@nestjs/common';
import { WorkerState } from '../../common/worker-state';
import { ITask } from '../../../interfaces/task.interface';
import { IWorker } from '../../common/worker.interface';
import { RegisterWorker, WorkerType } from '../../common/worker-registry';
import { TemplatesService } from '../../../llm/templates/templates.service';
import { LLMOptions } from '../../../llm/llm.interface';
import { OpenAiService } from '../../../llm/llm-providers/openai/openai.service';
import { ReviewedDataContext } from './data-review.interface';
import {
  // ExtractedPageData,
  ProcessedPagesData,
} from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';

@Injectable()
@RegisterWorker(WorkerType.DataReviewWorker)
export class DataReviewWorker implements IWorker {
  state: WorkerState<ReviewedDataContext & ITask>;
  protected readonly logger = new Logger(DataReviewWorker.name);

  constructor(
    private readonly templatesService: TemplatesService,
    private readonly openAiService: OpenAiService,
  ) {}

  private async initializeWorker(task: ITask): Promise<void> {
    this.state = new WorkerState(task);
    this.state.setInitialized();
    this.logger.log(`Initializing DataReviewWorker}`);
  }

  async execute(
    task: ITask,
    processedPagesData: ProcessedPagesData,
  ): Promise<ReviewedDataContext> {
    this.initializeWorker(task);

    // this.logger.log(`Executing: ${JSON.stringify(task)}`);

    this.logger.log(
      `Processed Pages Data: ${JSON.stringify(processedPagesData)}`,
    );

    try {
      const dataReviewTemplate =
        this.templatesService.getDataReviewTemplate('2.0');
      const dataReviewPrompt = dataReviewTemplate.render({
        task: task,
        processedPagesData: processedPagesData,
      });

      console.log(`Rendered prompt: ${dataReviewPrompt}`);

      const llmOptions: LLMOptions = {
        model: 'gpt-4o-2024-05-13',
        maxTokens: 2000,
        temperature: 0.3,
      };

      const llmResponseString = await this.openAiService.adapt(
        dataReviewPrompt,
        llmOptions,
      );
      console.log('processedData in form of schema:', llmResponseString);

      this.state.context.processedData =
        llmResponseString as ReviewedDataContext;
      this.state.setExecuted();
      return this.state.context.processedData;
    } catch (error) {
      this.handleError(error, this.state.context);
      throw error;
    } finally {
      if (this.state) {
        this.state.resetState();
      }
    }
  }

  async handleError(
    error: Error,
    context: ReviewedDataContext & ITask,
  ): Promise<void> {
    this.state.setError(error);
    this.logger.error(
      `Error occurred while processing task ${JSON.stringify(context)}`,
      error.stack,
    );
    // TODO extra error handling logic: cleanup, notifications, etc.
  }
}
