import { Injectable, Logger } from '@nestjs/common';
import { AgentState } from '../../common/agent-state';
import { ITask } from '../../../interfaces/task.interface';
import { IAgent } from '../../common/agent.interface';
import { RegisterAgent, AgentType } from '../../common/agent-registry';
import { TemplatesService } from '../../../llm/templates/templates.service';
import { LLMOptions } from '../../../llm/llm.interface';
import { OpenAiService } from '../../../llm/llms/openai/openai.service';
import { ExtractedDataContext } from './data-extraction-and-inference.interface';
import { ExtractedPageData } from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';

@Injectable()
@RegisterAgent(AgentType.DataExtractionAndInferenceAgent)
export class DataExtractionAndInferenceAgent implements IAgent {
  state: AgentState<ExtractedDataContext & ITask>;
  protected readonly logger = new Logger(DataExtractionAndInferenceAgent.name);

  constructor(
    private readonly templatesService: TemplatesService,
    private readonly openAiService: OpenAiService,
  ) {}

  private async initializeAgent(task: ITask): Promise<void> {
    this.state = new AgentState(task);
    this.state.setInitialized();
    this.logger.log(
      `Initializing DataExtractionAndInferenceAgent with task: ${JSON.stringify(task)}`,
    );
  }

  async execute(
    task: ITask,
    pageData: ExtractedPageData,
  ): Promise<ExtractedDataContext> {
    this.initializeAgent(task);

    this.logger.log(`Executing: ${JSON.stringify(task)}`);

    try {
      const dataExtractionTemplate =
        this.templatesService.getDataExtractionTemplate('1.0');
      const dataExtractionPrompt = dataExtractionTemplate.render({
        task: task,
        pageData: pageData,
      });

      console.log(`Rendered prompt: ${dataExtractionPrompt}`);

      const llmOptions: LLMOptions = {
        model: 'gpt-4o-2024-05-13',
        maxTokens: 500,
        temperature: 0.3,
      };

      const jsonifiedData = await this.openAiService.adapt(
        dataExtractionPrompt,
        llmOptions,
      );
      console.log(
        'url:',
        pageData.url,
        'extractedData in form of schema:',
        jsonifiedData,
      );

      this.state.setContext({
        url: pageData.url,
        jsonifiedData,
      } as Partial<ExtractedDataContext>);
      this.state.setExecuted();
      return this.state.context;
    } catch (error) {
      this.handleError(error, this.state.context);
      throw error;
    }
  }

  async handleError(
    error: Error,
    context: ExtractedDataContext & ITask,
  ): Promise<void> {
    this.state.setError(error);
    this.logger.error(
      `Error occurred while processing task ${JSON.stringify(context)}`,
      error.stack,
    );
    // TODO extra error handling logic: cleanup, notifications, etc.
  }
}
