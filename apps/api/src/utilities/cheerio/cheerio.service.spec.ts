import { Test, TestingModule } from '@nestjs/testing';
import { CheerioService } from './cheerio.service';

describe('CheerioService', () => {
  let service: CheerioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheerioService],
    }).compile();

    service = module.get<CheerioService>(CheerioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
