import { Injectable, Logger } from '@nestjs/common';
import { WorkerState } from '../../common/worker-state';
import { ITask } from '../../../interfaces/task.interface';
import { IWorker } from '../../common/worker.interface';
import { RegisterWorker, WorkerType } from '../../common/worker-registry';
import { TemplatesService } from '../../../llm/templates/templates.service';
import { LLMOptions } from '../../../llm/llm.interface';
import { OpenAiService } from '../../../llm/llm-providers/openai/openai.service';
import { ExtractedPageDataContext } from './data-extraction-and-inference.interface';
import { ExtractedPageData } from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';
import { JsonExtractionService } from '../../../common/utils/json-extraction-from-text/json-extraction.service';

@Injectable()
@RegisterWorker(WorkerType.DataExtractionAndInferenceWorker)
export class DataExtractionAndInferenceWorker implements IWorker {
  state: WorkerState<ExtractedPageDataContext & ITask>;
  protected readonly logger = new Logger(DataExtractionAndInferenceWorker.name);

  constructor(
    private readonly templatesService: TemplatesService,
    private readonly openAiService: OpenAiService,
    private readonly jsonExtractionService: JsonExtractionService,
  ) {}

  private async initializeWorker(task: ITask): Promise<void> {
    this.state = new WorkerState(task);
    this.state.setInitialized();
    this.logger.log(`Initializing DataExtractionAndInferenceWorker`);
  }

  async execute(
    task: ITask,
    extractedPagesData: ExtractedPageData,
  ): Promise<ExtractedPageDataContext> {
    this.initializeWorker(task);

    this.logger.log(
      `Executing DataExtractionAndInferenceWorker with Task: ${JSON.stringify(task)}`,
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
