import { CrawlRequestDto } from '../../crawler/dto/CrawlRequestDto.dto';
import { Page } from '../../utilities/puppeteer/puppeteer.service';

export interface StrategyContext {
  crawlRequestDto: CrawlRequestDto;
  page: Page;
  currentDepth?: number;
}

export interface CrawlerStrategy {
  execute(context: StrategyContext): Promise<any>;
}
