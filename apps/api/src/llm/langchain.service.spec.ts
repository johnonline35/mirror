import { Test, TestingModule } from '@nestjs/testing';
import { LangchainService } from './langchain.service';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';

describe('LangchainService', () => {
  let service: LangchainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LangchainService,
        ConfigService,
        {
          provide: ChatOpenAI,
          useValue: {
            invoke: jest.fn().mockResolvedValue('Mocked OpenAI response'),
          },
        },
      ],
    }).compile();

    service = module.get<LangchainService>(LangchainService);
  });

  it('test should correctly call OpenAI service and return a response', async () => {
    const response = await service.test();
    expect(response);
  });
});
