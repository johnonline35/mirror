import { INestApplicationContext } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { CrawlerService } from '../src/crawler/crawler.service';
import { NestFactory } from '@nestjs/core';
import { CrawlRequestDto } from '../src/crawler/dto/CrawlRequestDto.dto';

describe('CrawlerService (e2e)', () => {
  let app: INestApplicationContext;
  let crawlerService: CrawlerService;

  beforeEach(async () => {
    app = await NestFactory.createApplicationContext(AppModule);
    crawlerService = app.get(CrawlerService);
  });

  it('should crawl data successfully', async () => {
    const crawlRequestDto = new CrawlRequestDto();
    crawlRequestDto.url = 'https://news.ycombinator.com/';
    crawlRequestDto.maxDepth = 0;

    const result = await crawlerService.crawlUrl(crawlRequestDto);
    expect(result).toBeDefined();
  }, 60000);

  afterEach(async () => {
    await app.close();
  });
});
