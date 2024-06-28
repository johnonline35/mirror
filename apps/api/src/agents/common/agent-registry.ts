import { Provider, Type } from '@nestjs/common';

const agentRegistry = new Map<AgentType, Type>();

export function RegisterAgent(agentType: AgentType) {
  return function (constructor: any) {
    console.log(`Registering agent: ${agentType}`);
    agentRegistry.set(agentType, constructor);
  };
}

export function createAgentSymbol(agentType: AgentType) {
  return `AGENT_${agentType}`;
}

export const createAgentRegistrySymbol = () => `AGENT_REGISTRY`;

export function getAgentProviders(): Provider[] {
  const providers: Provider[] = [];

  const providerKeys: Set<string> = new Set();
  for (const [type, agent] of agentRegistry.entries()) {
    providers.push({
      provide: createAgentSymbol(type),
      useClass: agent,
    });
    providerKeys.add(createAgentSymbol(type));
  }

  providers.push({
    provide: createAgentRegistrySymbol(),
    useValue: providerKeys,
  });

  return providers;
}

export enum AgentType {
  CrawlSitePlanningAgent = 'CRAWL_SITE_PLANNING_AGENT',
  ValidatePromptAgent = 'VALIDATE_PROMPT_AGENT',
  CrawlHomepageAgent = 'CRAWL_HOMEPAGE_AGENT',
  CrawlWebsiteAgent = 'CRAWL_WEBSITE_AGENT',
  WebsiteTypeDetectionAgent = 'WEBSITE_TYPE_DETECTION_AGENT',
}
