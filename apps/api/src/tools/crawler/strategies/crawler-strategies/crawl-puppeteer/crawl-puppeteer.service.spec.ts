import { Test, TestingModule } from '@nestjs/testing';
import { CrawlPuppeteerStrategy } from './crawl-puppeteer.strategy';
import { PuppeteerUtilityService } from '../../../../../common/utils/puppeteer/puppeteer.service';
import { CommonModule } from '../../../../../common/common.module';
import { ITask } from '../../../../../interfaces/task.interface';

describe('CrawlHomepageService', () => {
  let service: CrawlPuppeteerStrategy;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CommonModule],
      providers: [CrawlPuppeteerStrategy, PuppeteerUtilityService],
    }).compile();

    service = module.get<CrawlPuppeteerStrategy>(CrawlPuppeteerStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should crawl and extract homepage data', async () => {
    const task: ITask = {
      type: 'structured-data-extraction',
      details: {
        url: 'https://www.neosync.dev/',
        prompt: 'This is an example proompt',
      },
      components: [],
      goal: 'this is the example goal',
    };

    const result = await service.execute(task);
    expect(result).toBeDefined();
    // expect(result.extractedHomePageText).toBeDefined();
    expect(result.internalLinks).toBeInstanceOf(Array);
    expect(result.externalLinks).toBeInstanceOf(Array);
    expect(result.imageUrls).toBeInstanceOf(Array);
  }, 60000);
});
