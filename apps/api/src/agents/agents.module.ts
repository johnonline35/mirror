import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { LlmModule } from '../llm/llm.module';
import { ToolsModule } from '../tools/tools.module';
import { getAgentProviders } from './common/agent-registry';
import { AgentsService } from './agents.service';
import { ValidatePromptAgent } from './types/validate-prompt/validate-prompt.agent';
import { CrawlHomepageAgent } from './types/crawl-homepage/crawl-homepage.agent';
import { CrawlSitePlanningAgent } from './types/crawl-site-planning/crawl-site-planning.agent';

@Module({
  imports: [CommonModule, LlmModule, ToolsModule],
  providers: [
    AgentsService,
    ValidatePromptAgent,
    CrawlHomepageAgent,
    CrawlSitePlanningAgent,
    ...getAgentProviders(),
  ],
  exports: [AgentsService],
})
export class AgentsModule {}
