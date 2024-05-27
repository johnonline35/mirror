import { Injectable, Logger } from '@nestjs/common';
import { BaseAgent } from '../base-agent';
import { OpenAiService } from '../../llm/llms/openai/openai.service';
import { TemplatesService } from '../../llm/templates/templates.service';
import { AdaptersService } from '../../llm/adapters/adapters.service';

@Injectable()
export class PlanningExecutionAgent extends BaseAgent {
  private readonly logger = new Logger(PlanningExecutionAgent.name);

  constructor(
    private readonly openAiService: OpenAiService,
    private readonly templatesService: TemplatesService,
    private readonly adaptersService: AdaptersService,
  ) {
    super();
  }

  async init(context: any): Promise<void> {
    this.logger.log(
      `Initializing PlanningExecutionAgent with context: ${JSON.stringify(context)}`,
    );
  }

  async execute(context: any): Promise<void> {
    const { prompt, templateVersion } = context;

    this.logger.log(`Using template version: ${templateVersion}`);
    const template =
      this.templatesService.getSummarizationTemplate(templateVersion);

    this.logger.log(`Creating plan with prompt: ${prompt}`);
    const plan = await this.openAiService.adapt(
      template.render({ text: prompt }),
    );

    context.plan = plan;
  }

  async handleResult(context: any): Promise<void> {
    this.logger.log(`Plan created: ${context.plan}`);
  }
}
