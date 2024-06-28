import { Injectable, Logger } from '@nestjs/common';
import { CrawlPuppeteerStrategy } from './crawler-strategies/crawl-puppeteer/crawl-puppeteer.strategy';
import { ICrawlerStrategy } from './crawler-strategies/crawler-strategy.interface';

@Injectable()
export class CrawlerStrategyFactory {
  private readonly logger = new Logger(CrawlerStrategyFactory.name);

  constructor(
    private readonly crawlPuppeteerStrategy: CrawlPuppeteerStrategy,
  ) {}

  getStrategy(type: string): ICrawlerStrategy {
    switch (type) {
      case 'puppeteer':
        return this.crawlPuppeteerStrategy;
      default:
        this.logger.error(`No strategy found for type: ${type}`);
        throw new Error(`No strategy found for type: ${type}`);
    }
  }
}
