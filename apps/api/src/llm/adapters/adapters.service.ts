import { Injectable } from '@nestjs/common';

import { LLMOptions } from '../llm.interface';
import { LLMAdapter } from './llmAdapter';
import { AdapterFactory } from './adapterFactory';

@Injectable()
export class AdaptersService {
  getAdapter(llm: string): LLMAdapter {
    return AdapterFactory.getAdapter(llm);
  }

  adapt(prompt: string, llm: string, options: LLMOptions): any {
    const adapter = this.getAdapter(llm);
    return adapter.adapt(prompt, options);
  }
}
