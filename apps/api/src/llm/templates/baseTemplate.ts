import { compile } from 'handlebars';
import { AdapterFactory } from '../adapters/adapterFactory';
import { LLMOptions } from '../llm.interface';

export abstract class BaseTemplate {
  protected template: string;
  protected version: string;

  constructor(template: string, version: string) {
    this.template = template;
    this.version = version;
  }

  render(data: Record<string, any>): string {
    const compiledTemplate = compile(this.template);
    return compiledTemplate(data);
  }

  validate(): boolean {
    // Add validation logic if needed
    return true;
  }

  adaptForLLM(llm: string, prompt: string, options: LLMOptions): any {
    const adapter = AdapterFactory.getAdapter(llm);
    return adapter.adapt(prompt, options);
  }

  getVersion(): string {
    return this.version;
  }
}
