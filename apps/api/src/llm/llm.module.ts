import { Module } from '@nestjs/common';
import { LangchainService } from './langchain/langchain.service';
import { OpenAiService } from './openai/openai.service';

@Module({
  providers: [LangchainService, OpenAiService],
  exports: [LangchainService, OpenAiService],
})
export class LlmModule {}
