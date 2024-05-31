import { LLMAdapter } from '../llmAdapter';
import { LLMOptions } from '../../../interfaces/llm.interface';

export class OpenAiAdapter implements LLMAdapter {
  adapt(prompt: string, options?: LLMOptions): any {
    console.log('OpenAiAdapter Options:', options);
    // Implement your adaptation logic for OpenAI here
    return JSON.parse(prompt);
  }
}
