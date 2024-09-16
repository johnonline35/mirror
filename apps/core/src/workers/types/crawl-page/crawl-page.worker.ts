import { Injectable, Logger } from '@nestjs/common';
import { WorkerState } from '../../common/worker-state';
import { ITask } from '../../../interfaces/task.interface';
import { IWorker } from '../../common/worker.interface';
import { RegisterWorker, WorkerType } from '../../common/worker-registry';
import { CrawlPageContext } from './crawl-page.interface';
import { CrawlerService } from '../../../tools/crawler/crawler.service';
import { ExtractedPageData } from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';
import { CheerioUtilityService } from '../../../common/utils/cheerio/cheerio.service';

@Injectable()
@RegisterWorker(WorkerType.CrawlPageWorker)
export class CrawlPageWorker implements IWorker {
  state: WorkerState<CrawlPageContext & ITask>;
  protected readonly logger = new Logger(CrawlPageWorker.name);

  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly cheerioUtilityService: CheerioUtilityService,
  ) {}

  private async initializeWorker(task: ITask): Promise<void> {
    this.state = new WorkerState(task);
    this.state.setInitialized();
    this.logger.log(`Initializing CrawlPageWorker`);
  }

  async execute(task: ITask, url: string): Promise<CrawlPageContext> {
    await this.initializeWorker(task);

    this.logger.log(`Executing: ${JSON.stringify(task)}`);

    try {
      const finalUrl = url || task.details.url;

      const rawPageHtml = await this.crawlerService.execute(task, url);

      const parsedHtml =
        await this.cheerioUtilityService.extractPageDataFromHtml(
          rawPageHtml,
          finalUrl,
        );

      this.state.context.individualPageDataObject =
        parsedHtml as ExtractedPageData;
      this.state.setExecuted();
      return this.state.context.individualPageDataObject;
    } catch (error) {
      await this.handleError(error, this.state.context);
      throw error;
    } finally {
      if (this.state) {
        this.state.resetState();
      }
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
