import { LLMOptions } from '../../interfaces/llm.interface';

export interface LLMAdapter {
  adapt(prompt: string, options: LLMOptions): any;
}
