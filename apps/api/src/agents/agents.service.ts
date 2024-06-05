import { Injectable } from '@nestjs/common';
import { IAgent } from './common/agent.interface';
import { getAgent, getAllAgents, AgentType } from './common/agent-registry';

@Injectable()
export class AgentsService {
  getAgent(agentType: AgentType): IAgent {
    return getAgent(agentType);
  }

  getAllAgents(): Map<AgentType, IAgent> {
    return getAllAgents();
  }
}
