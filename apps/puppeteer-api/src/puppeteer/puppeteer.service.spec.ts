import { Test, TestingModule } from '@nestjs/testing';
import { PuppeteerService } from './puppeteer.service';

describe('PuppeteerService', () => {
  let service: PuppeteerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PuppeteerService],
    }).compile();

    service = module.get<PuppeteerService>(PuppeteerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch HTML from a given URL', async () => {
    const task: any = {
      type: 'structured-data-extraction',
      details: {
        url: 'https://www.neosync.dev/',
        prompt: 'This is an example prompt',
      },
      components: [],
      goal: 'this is the example goal',
    };

    // Increase the timeout for real API calls
    const result = await service.runPuppeteer(task.details.url);
    // console.log('Result:', result);
    expect(result).toBeDefined();
    // You can add more specific assertions here depending on what the HTML should contain
  }, 120000);
});
