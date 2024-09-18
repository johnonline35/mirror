import { Injectable, Logger } from '@nestjs/common';
import { WorkerState } from '../../common/worker-state';
import { ITask } from '../../../interfaces/task.interface';
import { IWorker } from '../../common/worker.interface';
import { RegisterWorker, WorkerType } from '../../common/worker-registry';
import { TemplatesService } from '../../../llm/templates/templates.service';
import { LLMOptions } from '../../../llm/llm.interface';
import { OpenAiService } from '../../../llm/llm-providers/openai/openai.service';
import { ValidatePromptContext } from './validate-prompt.interface';

@Injectable()
@RegisterWorker(WorkerType.ValidatePromptWorker)
export class ValidatePromptWorker implements IWorker {
  state: WorkerState<ValidatePromptContext & ITask>;
  protected readonly logger = new Logger(ValidatePromptWorker.name);

  constructor(
    private readonly templatesService: TemplatesService,
    private readonly openAiService: OpenAiService,
  ) {}

  private async initializeWorker(task: ITask): Promise<void> {
    this.state = new WorkerState(task);
    this.state.setInitialized();
    this.logger.log(
      `Initializing ValidatePromptWorker with task: ${JSON.stringify(task)}`,
    );
  }

  async execute(
    task: ITask,
    llmOptions?: LLMOptions,
  ): Promise<ValidatePromptContext> {
    this.initializeWorker(task);
    if (!this.state.initialized) {
      throw new Error('Worker not initialized');
    }
    this.logger.log(`Executing: ${JSON.stringify(task)}`);

    try {
      const promptReviewTemplate =
        this.templatesService.getPromptReviewTemplate('1.0');
      const taskPrompt = promptReviewTemplate.render({
        task: task,
      });

      console.log(`Rendered prompt: ${taskPrompt}`);

      // const llmOptions: LLMOptions = {
      //   model: 'gpt-4o-mini-2024-07-18',
      //   maxTokens: 500,
      //   temperature: 0.3,
      // };
      if (llmOptions) {
        const promptReview = await this.openAiService.adapt(
          taskPrompt,
          llmOptions,
        );
        console.log(
          `Received prompt review from LLM: ${JSON.stringify(promptReview)}`,
        );

        this.state.context.promptReview = promptReview;
      } else {
        console.log(`No LLMOptions recieved`);
      }
      this.state.setExecuted();
      return this.state.context;
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
    context: ValidatePromptContext & ITask,
  ): Promise<void> {
    this.state.setError(error);
    this.logger.error(
      `Error occurred while processing task ${JSON.stringify(context)}`,
      error.stack,
    );
    // TODO extra error handling logic: cleanup, notifications, etc.
  }
}
