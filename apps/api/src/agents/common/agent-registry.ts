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
  ValidatePrompt = 'VALIDATE_PROMPT',
  CrawlHomepage = 'CRAWL_HOMEPAGE',
  WebsiteTypeDetection = 'WEBSITE_TYPE_DETECTION',
}
