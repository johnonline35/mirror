import { Injectable, Logger } from '@nestjs/common';
import { BaseAgentService } from '../common/base-agent.service';
import { CrawlHomepageService } from '../../tools/crawler/crawler.service';
import { ITask } from '../../interfaces/task.interface';
import { AgentState } from '../common/agent-state';

@Injectable()
export class CrawlHomepageAgent extends BaseAgentService<ITask> {
  protected readonly logger = new Logger(CrawlHomepageAgent.name);

  constructor(crawlHomepageService: CrawlHomepageService) {
    super(CrawlHomepageAgent.name);
    this.setTool(crawlHomepageService);
  }

  async init(context: ITask): Promise<void> {
    this.state = new AgentState(context);
    this.state.setInitialized();
    this.logger.log(
      `Initializing CrawlHomepageAgent with context: ${JSON.stringify(context)}`,
    );
  }

  async handleResult(context: ITask): Promise<void> {
    if (this.state.error) {
      this.logger.error(`Crawling failed: ${this.state.error.message}`);
    } else {
      this.logger.log(`Crawling result: ${JSON.stringify(context)}`);
    }
  }
}
