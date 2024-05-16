import { Test, TestingModule } from '@nestjs/testing';
import { OpenAiService } from './openai.service';
import { ConfigModule } from '@nestjs/config';

describe('OpenAiService', () => {
  let service: OpenAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [OpenAiService],
    }).compile();

    service = module.get<OpenAiService>(OpenAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
