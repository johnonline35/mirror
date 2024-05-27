import { Injectable, Logger } from '@nestjs/common';
import { BaseAgent } from '../base-agent';
import { OpenAiService } from '../../llm/llms/openai/openai.service';

@Injectable()
export class ReflectionCritiqueAgent extends BaseAgent {
  private readonly logger = new Logger(ReflectionCritiqueAgent.name);

  constructor(private readonly openAiService: OpenAiService) {
    super();
  }

  async init(context: any): Promise<void> {
    this.logger.log(
      `Initializing ReflectionCritiqueAgent with context: ${JSON.stringify(context)}`,
    );
  }

  async execute(context: any): Promise<void> {
    const { plan } = context;

    this.logger.log(`Reflecting on plan: ${plan}`);
    const critique = await this.openAiService.adapt(
      `Provide feedback and critique on the following plan: ${plan}`,
    );

    context.critique = critique;
  }

  async handleResult(context: any): Promise<void> {
    this.logger.log(`Critique provided: ${context.critique}`);
  }
}
