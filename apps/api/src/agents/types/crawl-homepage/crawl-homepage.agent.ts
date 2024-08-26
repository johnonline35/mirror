import { Injectable, Logger } from '@nestjs/common';
import { AgentState } from '../../common/agent-state';
import { ITask } from '../../../interfaces/task.interface';
import { IAgent } from '../../common/agent.interface';
import { RegisterAgent, AgentType } from '../../common/agent-registry';
import { CrawlHomepageContext } from './crawl-homepage.interface';
import { CrawlerService } from '../../../tools/crawler/crawler.service';
import { ExtractedPageData } from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';
import { CheerioUtilityService } from '../../../common/utils/cheerio/cheerio.service';

@Injectable()
@RegisterAgent(AgentType.CrawlHomepageAgent)
export class CrawlHomepageAgent implements IAgent {
  state: AgentState<CrawlHomepageContext & ITask>;
  protected readonly logger = new Logger(CrawlHomepageAgent.name);

  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly cheerioUtilityService: CheerioUtilityService,
  ) {}

  private async initializeAgent(task: ITask): Promise<void> {
    this.state = new AgentState(task);
    this.state.setInitialized();
    this.logger.log(
      `Initializing CrawlHomepageAgent with task: ${JSON.stringify(task)}`,
    );
  }

  async execute(task: ITask): Promise<CrawlHomepageContext> {
    await this.initializeAgent(task);

    this.logger.log(`Executing: ${JSON.stringify(task)}`);

    try {
      // the crawler service executes an isolated puppeteer/chromium lambda and returns raw html
      // this currently only returns an html string, not a puppeteer Page object
      const rawHomepageHtml = await this.crawlerService.execute(task);
      const parsedHtml =
        await this.cheerioUtilityService.extractPageDataFromHtml(
          rawHomepageHtml,
          task.details.url,
        );

      this.state.context.homepageData = parsedHtml as ExtractedPageData;
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
