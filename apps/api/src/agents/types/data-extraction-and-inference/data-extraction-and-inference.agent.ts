import { Injectable, Logger } from '@nestjs/common';
import { AgentState } from '../../common/agent-state';
import { ITask } from '../../../interfaces/task.interface';
import { IAgent } from '../../common/agent.interface';
import { RegisterAgent, AgentType } from '../../common/agent-registry';
import { TemplatesService } from '../../../llm/templates/templates.service';
import { LLMOptions } from '../../../llm/llm.interface';
import { OpenAiService } from '../../../llm/llm-providers/openai/openai.service';
import { ExtractedPageDataContext } from './data-extraction-and-inference.interface';
import { ExtractedPageData } from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';
import { JsonExtractionService } from '../../../common/utils/json-extraction-from-text/json-extraction.service';

@Injectable()
@RegisterAgent(AgentType.DataExtractionAndInferenceAgent)
export class DataExtractionAndInferenceAgent implements IAgent {
  state: AgentState<ExtractedPageDataContext & ITask>;
  protected readonly logger = new Logger(DataExtractionAndInferenceAgent.name);

  constructor(
    private readonly templatesService: TemplatesService,
    private readonly openAiService: OpenAiService,
    private readonly jsonExtractionService: JsonExtractionService,
  ) {}

  private async initializeAgent(task: ITask): Promise<void> {
    this.state = new AgentState(task);
    this.state.setInitialized();
    this.logger.log(`Initializing DataExtractionAndInferenceAgent`);
  }

  async execute(
    task: ITask,
    extractedPagesData: ExtractedPageData,
  ): Promise<ExtractedPageDataContext> {
    this.initializeAgent(task);

    this.logger.log(
      `Executing DataExtractionAndInferenceAgent with Task: ${JSON.stringify(task)}`,
    );

    try {
      const dataExtractionTemplate =
        this.templatesService.getDataExtractionTemplate('1.0');
      const dataExtractionPrompt = dataExtractionTemplate.render({
        task: task,
        individualPageDataObject: extractedPagesData,
      });

      console.log(
        `dataExtractionPrompt Rendered prompt: ${dataExtractionPrompt}`,
      );

      const llmOptions: LLMOptions = {
        model: 'gpt-4o-mini-2024-07-18',
        maxTokens: 2000,
        temperature: 0.3,
      };

      const llmExtractedPageData = await this.openAiService.adapt(
        dataExtractionPrompt,
        llmOptions,
      );
      console.log(
        'url:',
        extractedPagesData.url,
        'extractedData in form of schema:',
        llmExtractedPageData,
      );

      const resultJson =
        this.jsonExtractionService.extractValidJson(llmExtractedPageData);

      const extractedPageDataContext: ExtractedPageDataContext = {
        url: extractedPagesData.url,
        extractedPageDataJson: resultJson as ExtractedPageDataContext,
      };

      // Stringify the JSON data before using it in the template
      const structuredDataForTemplate = {
        ...extractedPageDataContext,
        extractedPageDataJson: JSON.stringify(resultJson, null, 2), // Pretty-print JSON for readability
      };

      this.state.context.extractedPageDataJson = structuredDataForTemplate;

      console.log('resultJson', structuredDataForTemplate);

      this.state.setExecuted();
      return structuredDataForTemplate;
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
    context: ExtractedPageDataContext & ITask,
  ): Promise<void> {
    this.state.setError(error);
    this.logger.error(
      `Error occurred while processing task ${JSON.stringify(context)}`,
      error.stack,
    );
    // TODO extra error handling logic: cleanup, notifications, etc.
  }
}
