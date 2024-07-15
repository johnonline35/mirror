import { Injectable, Logger } from '@nestjs/common';
import { CrawlerStrategyFactory } from './strategies/crawler-strategy.factory';
import { ITask, TaskComponentType } from '../../interfaces/task.interface';
import { TaskComponent } from '../../components-registry/components-registry.decorator';
import { ITool } from '../tools.interface';
import { UrlExtractorService } from '../../common/utils/parsing/url-extractor.service';

@Injectable()
@TaskComponent(TaskComponentType.TOOL)
export class CrawlerService implements ITool<ITask> {
  name = 'Crawler Service';
  description =
    'Crawls websites and does things like html extraction, image extraction, link extraction and anything else needed to get data from a website for further decision making and deeper continuous / recursive crawling';
  type: TaskComponentType = TaskComponentType.TOOL;

  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private readonly crawlerStrategyFactory: CrawlerStrategyFactory,
    private readonly urlExtractorService: UrlExtractorService,
  ) {}

  async execute(task: ITask, url?: string): Promise<any> {
    const taskUrl = task.details.url;
    const strategy = this.getStrategy(taskUrl, url);
    return strategy.execute(task, url);
  }

  private getStrategy(taskUrl: string, url?: string) {
    // the url only exists after the taskUrl has been parsed on the first run
    // this means that the function will priotize url over taskUrl which is only used once
    if (url) {
      const domainName = this.urlExtractorService.extractDomainName(url);
      return this.crawlerStrategyFactory.getStrategy(domainName);
    } else {
      const domainName = this.urlExtractorService.extractDomainName(taskUrl);
      return this.crawlerStrategyFactory.getStrategy(domainName);
    }
  }
}
