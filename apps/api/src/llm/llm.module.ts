import { Module } from '@nestjs/common';
import { OpenAiService } from './llms/openai/openai.service';
import { ClaudeService } from './llms/claude/claude.service';
import { AdaptersModule } from './adapters/adapters.module';
import { TemplatesService } from './templates/templates.service';

@Module({
  imports: [AdaptersModule],
  providers: [OpenAiService, ClaudeService, TemplatesService],
  exports: [OpenAiService, ClaudeService, TemplatesService],
})
export class LlmModule {}
