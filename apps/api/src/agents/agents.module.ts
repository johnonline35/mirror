import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { LlmModule } from '../llm/llm.module';
import { ToolsModule } from '../tools/tools.module';
import { getAgentProviders } from './common/agent-registry';
import { AgentsService } from './agents.service';
import { ValidatePromptAgent } from './types/validate-prompt/validate-prompt.agent';
import { CrawlHomepageAgent } from './types/crawl-homepage/crawl-homepage.agent';
import { CrawlSitePlanningAgent } from './types/crawl-site-planning/crawl-site-planning.agent';
import { CrawlPageAgent } from './types/crawl-page/crawl-page.agent';
import { DataExtractionAndInferenceAgent } from './types/data-extraction-and-inference/data-extraction-and-inference.agent';
import { DataReviewAgent } from './types/data-review/data-review.agent';

@Module({
  imports: [CommonModule, LlmModule, ToolsModule],
  providers: [
    AgentsService,
    ValidatePromptAgent,
    CrawlHomepageAgent,
    CrawlPageAgent,
    CrawlSitePlanningAgent,
    DataExtractionAndInferenceAgent,
    DataReviewAgent,
    ...getAgentProviders(),
  ],
  exports: [AgentsService],
})
export class AgentsModule {}
