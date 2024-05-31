// src/agents/agents.module.ts
import { Module } from '@nestjs/common';
import { OpenAiService } from '../llm/llms/openai/openai.service';
import { TemplatesService } from '../llm/templates/templates.service';
import { AdaptersService } from '../llm/adapters/adapters.service';
import { WebsiteTypeDetectionAgent } from './types/website-type-detection-agent';
import { CrawlHomepageService } from '../tools/crawler/crawler.service';
import { ReviewPromptAgent } from './types/review-prompt-agent';

@Module({
  providers: [
    OpenAiService,
    TemplatesService,
    AdaptersService,
    CrawlHomepageService,
    ReviewPromptAgent,
  ],
  exports: [WebsiteTypeDetectionAgent],
})
export class AgentsModule {}
