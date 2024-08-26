import { Module } from '@nestjs/common';
import { OpenAiService } from './llm-providers/openai/openai.service';
import { ClaudeService } from './llm-providers/claude/claude.service';
import { TemplatesService } from './templates/templates.service';

@Module({
  imports: [],
  providers: [OpenAiService, ClaudeService, TemplatesService],
  exports: [OpenAiService, ClaudeService, TemplatesService],
})
export class LlmModule {}
