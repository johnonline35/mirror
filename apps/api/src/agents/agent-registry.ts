import { IAgent } from '../interfaces/agent.interface';
import { AgentType } from './agent-types.enum';

const agentRegistry = new Map<AgentType, IAgent>();

export function RegisterAgent(agentType: AgentType) {
  return function (constructor: any) {
    const instance = new constructor();
    agentRegistry.set(agentType, instance);
  };
}

export function getAgent(agentType: AgentType): IAgent | undefined {
  return agentRegistry.get(agentType);
}

export function getAllAgents(): Map<AgentType, IAgent> {
  return agentRegistry;
}
