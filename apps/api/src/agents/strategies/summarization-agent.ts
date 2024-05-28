import { Injectable, Logger } from '@nestjs/common';
import { BaseAgent } from '../base-agent';
import { OpenAiService } from '../../llm/llms/openai/openai.service';
import { TemplatesService } from '../../llm/templates/templates.service';
import { AgentState, SummarizationContext } from '../../common/state/state';

@Injectable()
export class SummarizationAgent extends BaseAgent {
  private readonly logger = new Logger(SummarizationAgent.name);
  private state: AgentState;

  constructor(
    private readonly openAiService: OpenAiService,
    private readonly templatesService: TemplatesService,
  ) {
    super();
  }

  async init(context: SummarizationContext): Promise<void> {
    this.state = new AgentState(context);
    this.state.setInitialized();
    this.logger.log(
      `Initializing SummarizationAgent with context: ${JSON.stringify(context)}`,
    );
  }

  async execute(): Promise<void> {
    if (!this.state.initialized) {
      throw new Error('Agent not initialized');
    }

    try {
      const { extractedHomePage } = this.state.context;
      const summarizationTemplate =
        this.templatesService.getSummarizationTemplate('3.0');
      const summarizationPrompt = summarizationTemplate.render({
        text: extractedHomePage,
      });

      const summarizationOptions = this.getSummarizationOptions();

      const summarizedText = await this.openAiService.adapt(
        summarizationPrompt,
        summarizationOptions,
      );
      this.state.context.summarizedText = summarizedText;
      this.state.setExecuted();
    } catch (error) {
      this.handleError(error);
    }
  }

  private getSummarizationOptions() {
    return {
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo-0125',
      maxTokens: 500,
      temperature: 0.3,
    };
  }

  async handleResult(): Promise<void> {
    if (this.state.error) {
      this.logger.error(`Summarization failed: ${this.state.error.message}`);
    } else {
      this.logger.log(`Summarized text: ${this.state.context.summarizedText}`);
    }
  }

  handleError(error: Error): void {
    this.state.setError(error);
    this.logger.error(`Error in SummarizationAgent:`, error);
  }
}
