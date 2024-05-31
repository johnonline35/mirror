import { INestApplicationContext } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { CrawlerService } from '../src/tools/crawler/crawler.service';
import { NestFactory } from '@nestjs/core';
import { CrawlRequestDto } from '../src/tools/crawler/dto/CrawlRequestDto.dto';

describe('CrawlerService (e2e)', () => {
  let app: INestApplicationContext;
  let crawlerService: CrawlerService;

  beforeEach(async () => {
    try {
      app = await NestFactory.createApplicationContext(AppModule);
      await app.init();
      crawlerService = app.get(CrawlerService);
    } catch (error) {
      console.error('Error during test setup:', error);
    }
  });

  it('should crawl data successfully', async () => {
    const crawlRequestDto = new CrawlRequestDto('https://www.neosync.dev/', 1);

    const result = await crawlerService.crawlUrl(crawlRequestDto);
    expect(result).toBeDefined();
  }, 300000);

  afterEach(async () => {
    await app.close();
  });
});
