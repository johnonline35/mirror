// src/agents/agents.module.ts
import { Module } from '@nestjs/common';
import { PlanningExecutionAgent } from './strategies/planning-agent';
import { ReflectionCritiqueAgent } from './strategies/reflection-agent';
import { OpenAiService } from '../llm/llms/openai/openai.service';
import { TemplatesService } from '../llm/templates/templates.service';
import { AdaptersService } from '../llm/adapters/adapters.service';

@Module({
  providers: [
    PlanningExecutionAgent,
    ReflectionCritiqueAgent,
    OpenAiService,
    TemplatesService,
    AdaptersService,
  ],
  exports: [PlanningExecutionAgent, ReflectionCritiqueAgent],
})
export class AgentsModule {}
