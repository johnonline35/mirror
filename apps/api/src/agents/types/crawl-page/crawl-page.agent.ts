import { Injectable, Logger } from '@nestjs/common';
import { AgentState } from '../../common/agent-state';
import { ITask } from '../../../interfaces/task.interface';
import { IAgent } from '../../common/agent.interface';
import { RegisterAgent, AgentType } from '../../common/agent-registry';
import { CrawlPageContext } from './crawl-page.interface';
import { CrawlerService } from '../../../tools/crawler/crawler.service';
import { ExtractedPageData } from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';

@Injectable()
@RegisterAgent(AgentType.CrawlPageAgent)
export class CrawlPageAgent implements IAgent {
  state: AgentState<CrawlPageContext & ITask>;
  protected readonly logger = new Logger(CrawlPageAgent.name);

  constructor(private readonly crawlerService: CrawlerService) {}

  private async initializeAgent(task: ITask): Promise<void> {
    this.state = new AgentState(task);
    this.state.setInitialized();
    this.logger.log(
      `Initializing CrawlHomepageAgent with task: ${JSON.stringify(task)}`,
    );
  }

  async execute(task: ITask, url: string): Promise<CrawlPageContext> {
    await this.initializeAgent(task);

    this.logger.log(`Executing: ${JSON.stringify(task)}`);

    try {
      const pageData = await this.crawlerService.execute(task, url);
      this.state.context.pageData = pageData as ExtractedPageData;
      this.state.setExecuted();
      return this.state.context.pageData;
    } catch (error) {
      await this.handleError(error, this.state.context);
      throw error;
    }
  }

  async handleError(
    error: Error,
    context: CrawlPageContext & ITask,
  ): Promise<void> {
    this.state.setError(error);
    this.logger.error(
      `Error occurred while processing task ${JSON.stringify(context)}`,
      error.stack,
    );
    // TODO extra error handling logic: cleanup, notifications, etc.
  }
}
