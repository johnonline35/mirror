import { Injectable, Logger } from '@nestjs/common';
import { CrawlPuppeteerStrategy } from './crawler-strategies/crawl-puppeteer/crawl-puppeteer.strategy';
import { ICrawlerStrategy } from './crawler-strategies/crawler-strategy.interface';

@Injectable()
export class CrawlerStrategyFactory {
  private readonly logger = new Logger(CrawlerStrategyFactory.name);

  constructor(
    private readonly crawlPuppeteerStrategy: CrawlPuppeteerStrategy,
  ) {}

  getStrategy(domainName: string): ICrawlerStrategy {
    switch (domainName) {
      case 'google.com':
        return this.crawlPuppeteerStrategy;
      default:
        return this.crawlPuppeteerStrategy;
    }
  }
}
