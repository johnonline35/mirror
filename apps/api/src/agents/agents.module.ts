import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { LlmModule } from '../llm/llm.module';
import { ToolsModule } from '../tools/tools.module';
import { getAgentProviders } from './common/agent-registry';
import { GetAgentsService } from './agents.service';

@Module({
  imports: [CommonModule, LlmModule, ToolsModule],
  providers: [GetAgentsService, ...getAgentProviders()],
  exports: [GetAgentsService],
})
export class AgentsModule {}
