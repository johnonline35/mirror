// src/agents/classification-agent.ts
import { Injectable, Logger } from '@nestjs/common';
import { BaseAgent } from '../base-agent';
import { OpenAiService } from '../../llm/llms/openai/openai.service';
import { TemplatesService } from '../../llm/templates/templates.service';
import { AgentState } from '../../common/state/state';

@Injectable()
export class ClassificationAgent extends BaseAgent {
  private readonly logger = new Logger(ClassificationAgent.name);
  private state: AgentState;

  constructor(
    private readonly openAiService: OpenAiService,
    private readonly templatesService: TemplatesService,
  ) {
    super();
  }

  async init(context: any): Promise<void> {
    this.state = new AgentState(context);
    this.state.setInitialized();
    this.logger.log(
      `Initializing ClassificationAgent with context: ${JSON.stringify(context)}`,
    );
  }

  async execute(): Promise<void> {
    try {
      if (!this.state.initialized) {
        throw new Error('Agent not initialized');
      }

      const { summarizedText } = this.state.context;
      const classificationTemplate =
        this.templatesService.getClassificationTemplate('1.0');
      const classificationPrompt = classificationTemplate.render({
        summary: summarizedText,
      });

      const classificationOptions = {
        model: 'gpt-4o-2024-05-13',
        maxTokens: 50,
        temperature: 0,
      };

      const strategyName = await this.openAiService.adapt(
        classificationPrompt,
        classificationOptions,
      );
      this.state.context.classificationResult = strategyName;
      this.state.setExecuted();
    } catch (error) {
      this.handleError(error);
    }
  }

  async handleResult(): Promise<void> {
    if (this.state.error) {
      this.logger.error(`Classification failed: ${this.state.error.message}`);
    } else {
      this.logger.log(
        `Classification result: ${this.state.context.classificationResult}`,
      );
    }
  }

  handleError(error: Error): void {
    this.state.setError(error);
    this.logger.error(`Error in ClassificationAgent:`, error);
  }
}
