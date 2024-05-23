import { AnthropicAdapter } from './llm-specific-adapters/anthropicAdapter';
import { OpenAiAdapter } from './llm-specific-adapters/openAiAdapter';
import { LLMAdapter } from './llmAdapter';

export class AdapterFactory {
  static getAdapter(llm: string): LLMAdapter {
    switch (llm) {
      case 'openai':
        return new OpenAiAdapter();
      case 'anthropic':
        return new AnthropicAdapter();
      default:
        throw new Error(`No adapter found for LLM: ${llm}`);
    }
  }
}
