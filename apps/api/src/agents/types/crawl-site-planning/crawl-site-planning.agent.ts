import { Injectable, Logger } from '@nestjs/common';
import { AgentState } from '../../common/agent-state';
import { ITask } from '../../../interfaces/task.interface';
import { IAgent } from '../../common/agent.interface';
import { RegisterAgent, AgentType } from '../../common/agent-registry';
import { TemplatesService } from '../../../llm/templates/templates.service';
import { LLMOptions } from '../../../llm/llm.interface';
import { OpenAiService } from '../../../llm/llms/openai/openai.service';
import {
  CrawlSitePlanningContext,
  LlmCrawlingPlan,
} from './crawl-site-planning.interface';

@Injectable()
@RegisterAgent(AgentType.CrawlSitePlanningAgent)
export class CrawlSitePlanningAgent implements IAgent {
  state: AgentState<CrawlSitePlanningContext & ITask>;
  protected readonly logger = new Logger(CrawlSitePlanningAgent.name);

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

  async execute(
    task: ITask,
    additionalData: any,
  ): Promise<CrawlSitePlanningContext> {
    this.initializeAgent(task);
    if (!this.state.initialized) {
      throw new Error('Agent not initialized');
    }
    this.logger.log(`Executing: ${JSON.stringify(task)}`);

    try {
      const siteCrawlPlanTemplate =
        this.templatesService.getSiteCrawlPlanTemplate('2.0');
      console.log('additionalData:', additionalData);
      const siteCrawlPlan = siteCrawlPlanTemplate.render({
        task: task,
        additionalData: additionalData,
      });

      console.log(`Rendered plan: ${siteCrawlPlan}`);

      const llmOptions: LLMOptions = {
        model: 'gpt-4o-2024-05-13',
        maxTokens: 500,
        temperature: 1,
      };

      const plan = await this.openAiService.adapt(siteCrawlPlan, llmOptions);
      // console.log(
      //   `Received site crawling plan from LLM: ${JSON.stringify(plan)}`,
      // );

      this.state.context.plan = plan as LlmCrawlingPlan;
      this.state.setExecuted();
      return this.state.context.plan;
    } catch (error) {
      this.handleError(error, this.state.context);
      throw error;
    }
  }

  async handleError(
    error: Error,
    context: CrawlSitePlanningContext & ITask,
  ): Promise<void> {
    this.state.setError(error);
    this.logger.error(
      `Error occurred while processing task ${JSON.stringify(context)}`,
      error.stack,
    );
    // TODO extra error handling logic: cleanup, notifications, etc.
  }
}
