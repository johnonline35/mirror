import { Module } from '@nestjs/common';
import { ValidatePromptAgent } from './types/validate-prompt/validate-prompt.agent';
import { CommonModule } from '../common/common.module';
import { GetAgentsService } from './agents.service';
import { LlmModule } from '../llm/llm.module';
import { ToolsModule } from '../tools/tools.module';

@Module({
  imports: [CommonModule, LlmModule, ToolsModule],
  providers: [ValidatePromptAgent, GetAgentsService],
  exports: [ValidatePromptAgent, GetAgentsService],
})
export class AgentsModule {}
