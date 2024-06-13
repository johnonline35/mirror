import { LLMOptions } from '../llm.interface';

export interface LLMAdapter {
  adapt(prompt: string, options: LLMOptions): any;
}
