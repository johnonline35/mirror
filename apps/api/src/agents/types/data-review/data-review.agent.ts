import { Injectable, Logger } from '@nestjs/common';
import { AgentState } from '../../common/agent-state';
import { ITask } from '../../../interfaces/task.interface';
import { IAgent } from '../../common/agent.interface';
import { RegisterAgent, AgentType } from '../../common/agent-registry';
import { TemplatesService } from '../../../llm/templates/templates.service';
import { LLMOptions } from '../../../llm/llm.interface';
import { OpenAiService } from '../../../llm/llm-providers/openai/openai.service';
import { ReviewedDataContext } from './data-review.interface';
import {
  // ExtractedPageData,
  ProcessedPagesData,
} from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';

@Injectable()
@RegisterAgent(AgentType.DataReviewAgent)
export class DataReviewAgent implements IAgent {
  state: AgentState<ReviewedDataContext & ITask>;
  protected readonly logger = new Logger(DataReviewAgent.name);

  constructor(
    private readonly templatesService: TemplatesService,
    private readonly openAiService: OpenAiService,
  ) {}

  private async initializeAgent(task: ITask): Promise<void> {
    this.state = new AgentState(task);
    this.state.setInitialized();
    this.logger.log(
      `Initializing DataReviewAgent with task: ${JSON.stringify(task)}`,
    );
  }

  async execute(
    task: ITask,
    processedPagesData: ProcessedPagesData,
  ): Promise<ReviewedDataContext> {
    this.initializeAgent(task);

    this.logger.log(`Executing: ${JSON.stringify(task)}`);

    try {
      const dataReviewTemplate =
        this.templatesService.getDataReviewTemplate('1.0');
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

      const processedData = await this.openAiService.adapt(
        dataReviewPrompt,
        llmOptions,
      );
      console.log('processedData in form of schema:', processedData);

      this.state.setContext({ processedData } as Partial<ReviewedDataContext>);
      this.state.setExecuted();
      return this.state.context;
    } catch (error) {
      this.handleError(error, this.state.context);
      throw error;
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
