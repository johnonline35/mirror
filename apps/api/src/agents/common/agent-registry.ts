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
  CrawlHomepageAgent = 'CRAWL_HOMEPAGE_AGENT',
  CrawlPageAgent = 'CrawlPageAgent',
  CrawlSitePlanningAgent = 'CRAWL_SITE_PLANNING_AGENT',
  DataExtractionAndInferenceAgent = 'DATA_EXTRACTION_AND_INFERENCE_AGENT',
  DataReviewAgent = 'DATA_REVIEW_AGENT',
  ReflectionAgent = 'REFLECTION_AGENT',
  ValidatePromptAgent = 'VALIDATE_PROMPT_AGENT',
}
