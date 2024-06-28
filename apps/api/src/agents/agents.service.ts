import { Injectable } from '@nestjs/common';
import { IAgent } from './common/agent.interface';
import { AgentType, createAgentSymbol } from './common/agent-registry';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class AgentsService {
  constructor(private readonly moduleRef: ModuleRef) {}

  getAgent(agentType: AgentType): IAgent {
    return this.moduleRef.get(createAgentSymbol(agentType));
  }
}
