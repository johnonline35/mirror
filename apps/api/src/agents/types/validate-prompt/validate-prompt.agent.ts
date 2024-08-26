import { Injectable, Logger } from '@nestjs/common';
import { AgentState } from '../../common/agent-state';
import { ITask } from '../../../interfaces/task.interface';
import { IAgent } from '../../common/agent.interface';
import { RegisterAgent, AgentType } from '../../common/agent-registry';
import { TemplatesService } from '../../../llm/templates/templates.service';
import { LLMOptions } from '../../../llm/llm.interface';
import { OpenAiService } from '../../../llm/llm-providers/openai/openai.service';
import { ValidatePromptContext } from './validate-prompt.interface';

@Injectable()
@RegisterAgent(AgentType.ValidatePromptAgent)
export class ValidatePromptAgent implements IAgent {
  state: AgentState<ValidatePromptContext & ITask>;
  protected readonly logger = new Logger(ValidatePromptAgent.name);

  constructor(
    private readonly templatesService: TemplatesService,
    private readonly openAiService: OpenAiService,
  ) {}

  private async initializeAgent(task: ITask): Promise<void> {
    this.state = new AgentState(task);
    this.state.setInitialized();
    this.logger.log(
      `Initializing ValidatePromptAgent with task: ${JSON.stringify(task)}`,
    );
  }

  async execute(task: ITask): Promise<ValidatePromptContext> {
    this.initializeAgent(task);
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

      console.log(`Rendered prompt: ${taskPrompt}`);

      const llmOptions: LLMOptions = {
        model: 'gpt-4o-mini-2024-07-18',
        maxTokens: 500,
        temperature: 0.3,
      };

      const promptReview = await this.openAiService.adapt(
        taskPrompt,
        llmOptions,
      );
      console.log(
        `Received prompt review from LLM: ${JSON.stringify(promptReview)}`,
      );

      this.state.context.promptReview = promptReview;
      this.state.setExecuted();
      return this.state.context;
    } catch (error) {
      this.handleError(error, this.state.context);
      throw error;
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
