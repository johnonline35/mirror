import { Injectable, Logger } from '@nestjs/common';
import { AgentState } from '../../common/agent-state';
import { ITask } from '../../../interfaces/task.interface';
import { IAgent } from '../../common/agent.interface';
import { RegisterAgent, AgentType } from '../../common/agent-registry';
import { CrawlHomepageContext } from './crawl-homepage.interface';
import { CrawlerService } from '../../../tools/crawler/crawler.service';
import { ExtractedPageData } from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';

@Injectable()
@RegisterAgent(AgentType.CrawlHomepageAgent)
export class CrawlHomepageAgent implements IAgent {
  state: AgentState<CrawlHomepageContext & ITask>;
  protected readonly logger = new Logger(CrawlHomepageAgent.name);

  constructor(private readonly crawlerService: CrawlerService) {}

  private async initializeAgent(task: ITask): Promise<void> {
    this.state = new AgentState(task);
    this.state.setInitialized();
    this.logger.log(
      `Initializing CrawlHomepageAgent with task: ${JSON.stringify(task)}`,
    );
  }

  async execute(task: ITask): Promise<CrawlHomepageContext> {
    await this.initializeAgent(task);
    if (!this.state.initialized) {
      throw new Error('Agent not initialized');
    }
    this.logger.log(`Executing: ${JSON.stringify(task)}`);

    try {
      const homepageData = await this.crawlerService.execute(task, 'puppeteer');
      this.state.context.homepageData = homepageData as ExtractedPageData;
      this.state.setExecuted();
      return this.state.context.homepageData;
    } catch (error) {
      await this.handleError(error, this.state.context);
      throw error;
    }
  }

  async handleError(
    error: Error,
    context: CrawlHomepageContext & ITask,
  ): Promise<void> {
    this.state.setError(error);
    this.logger.error(
      `Error occurred while processing task ${JSON.stringify(context)}`,
      error.stack,
    );
    // TODO extra error handling logic: cleanup, notifications, etc.
  }
}
