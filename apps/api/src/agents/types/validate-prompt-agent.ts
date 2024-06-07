import { Injectable, Logger } from '@nestjs/common';
import { AgentState } from '../common/agent-state';
import { ITask } from '../../interfaces/task.interface';
import { IAgent } from '../common/agent.interface';
import { RegisterAgent, AgentType } from '../common/agent-registry';
import { TemplatesService } from '../../llm/templates/templates.service';
import { LLMOptions } from '../../interfaces/llm.interface';
import { OpenAiService } from '../../llm/llms/openai/openai.service';
import { ValidatePromptContext } from './interfaces/validate-prompt-agent.interface';

@Injectable()
@RegisterAgent(AgentType.ValidatePromptAgent)
export class ValidatePromptAgent implements IAgent {
  state: AgentState<ValidatePromptContext & ITask>;
  protected readonly logger = new Logger(ValidatePromptAgent.name);

  constructor(
    private readonly templatesService: TemplatesService,
    private readonly openAiService: OpenAiService,
  ) {}

  async init(task: ITask): Promise<void> {
    this.state = new AgentState(task);
    this.state.setInitialized();
    this.logger.log(
      `Initializing ValidatePromptAgent with task: ${JSON.stringify(task)}`,
    );
  }

  async execute(task: ITask): Promise<any> {
    if (!this.state.initialized) {
      throw new Error('Agent not initialized');
    }
    this.logger.log(`Executing: ${JSON.stringify(task)}`);

    try {
      const promptReviewTemplate =
        this.templatesService.getPromptReviewTemplate('1.0');
      const taskPrompt = promptReviewTemplate.render({
        task: task,
      });

      this.logger.debug(`Rendered prompt: ${taskPrompt}`);

      const llmOptions: LLMOptions = {
        model: 'gpt-3.5-turbo-0125',
        maxTokens: 500,
        temperature: 0.3,
      };

      const promptReview = await this.openAiService.adapt(
        taskPrompt,
        llmOptions,
      );
      this.logger.log(
        `Received prompt review from LLM: ${JSON.stringify(promptReview)}`,
      );

      this.state.context.promptReview = promptReview;
      this.state.setExecuted();
      return promptReview;
    } catch (error) {
      this.handleError(error, this.state.context);
      throw error;
    }
  }

  async handleResult(task: ITask, promptReview: any): Promise<void> {
    if (!this.state.error) {
      this.logger.log(`Prompt review processing result: ${promptReview}`);
      // TODO handle the result
    } else {
      this.logger.error(
        `Prompt processing failed: ${this.state.error.message}`,
      );
    }
  }

  async handleError(
    error: Error,
    context: ValidatePromptContext & ITask,
  ): Promise<void> {
    this.state.setError(error);
    this.logger.error(
      `Error occurred while processing task ${JSON.stringify(context)}: ${error.message}`,
      error.stack,
    );
    // TODO extra error handling logic: cleanup, notifications, etc.
  }
}
