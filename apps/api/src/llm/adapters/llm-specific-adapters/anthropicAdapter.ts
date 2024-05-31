import { LLMAdapter } from '../llmAdapter';
import { LLMOptions } from '../../../interfaces/llm.interface';

export class AnthropicAdapter implements LLMAdapter {
  adapt(prompt: string, options: LLMOptions): any {
    console.log('AnthropicAdapter Options:', options);
    // Implement your adaptation logic for Anthropic here
    return JSON.parse(prompt);
  }
}
