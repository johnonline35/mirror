import { Module } from '@nestjs/common';
import { OpenAiService } from './llms/openai/openai.service';
import { ClaudeService } from './llms/claude/claude.service';
import { TemplatesModule } from './templates/templates.module';
import { AdaptersModule } from './adapters/adapters.module';

@Module({
  providers: [OpenAiService, ClaudeService],
  exports: [OpenAiService, ClaudeService],
  imports: [TemplatesModule, AdaptersModule],
})
export class LlmModule {}
