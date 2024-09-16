import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { CrawlerService } from './crawler.service';
import { LlmModule } from '../../llm/llm.module';
import { CrawlerStrategyFactory } from './strategies/crawler-strategy.factory';
import { CrawlPuppeteerStrategy } from './strategies/crawler-strategies/crawl-puppeteer/crawl-puppeteer.strategy';
import { LambdaModule } from '../../lambda/lambda.module';

@Module({
  imports: [CommonModule, LlmModule, LambdaModule],
  providers: [CrawlerService, CrawlerStrategyFactory, CrawlPuppeteerStrategy],
  exports: [CrawlerService, CrawlerStrategyFactory, CrawlPuppeteerStrategy],
})
export class CrawlerModule {}
