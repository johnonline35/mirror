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
    // TODO add validation logic
    return true;
  }

  adaptForLLM(prompt: string, options: LLMOptions): any {
    const adapter = AdapterFactory.getAdapter(options.model);
    return adapter.adapt(prompt, options);
  }

  getVersion(): string {
    return this.version;
  }
}
