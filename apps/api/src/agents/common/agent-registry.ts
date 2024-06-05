import { IAgent } from './agent.interface';

const agentRegistry = new Map<AgentType, IAgent>();

export function RegisterAgent(agentType: AgentType) {
  return function (constructor: any) {
    const instance = new constructor();
    agentRegistry.set(agentType, instance);
  };
}

export function getAgent(agentType: AgentType): IAgent {
  return agentRegistry.get(agentType);
}

export function getAllAgents(): Map<AgentType, IAgent> {
  return agentRegistry;
}

export enum AgentType {
  ValidatePromptAgent = 'VALIDATE_PROMPT_AGENT',
  CrawlHomepageAgent = 'CRAWL_HOMEPAGE_AGENT',
}
