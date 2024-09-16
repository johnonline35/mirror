import Handlebars from 'handlebars';

export abstract class BaseTemplate {
  protected template: string;
  protected version: string;

  constructor(template: string, version: string) {
    this.template = template;
    this.version = version;

    this.registerHelpers();
  }

  private registerHelpers(): void {
    if (!Handlebars.helpers.json) {
      Handlebars.registerHelper('json', function (context) {
        return JSON.stringify(context, null, 2);
      });
    }
  }

  render(data: Record<string, any>): string {
    const compiledTemplate = Handlebars.compile(this.template);
    return compiledTemplate(data);
  }

  validate(): boolean {
    // TODO add validation logic
    return true;
  }

  getVersion(): string {
    return this.version;
  }
}

// import { compile } from 'handlebars';
// import { AdapterFactory } from '../adapters/adapterFactory';
// import { LLMOptions } from '../llm.interface';

// export abstract class BaseTemplate {
//   protected template: string;
//   protected version: string;

//   constructor(template: string, version: string) {
//     this.template = template;
//     this.version = version;
//   }

//   render(data: Record<string, any>): string {
//     const compiledTemplate = compile(this.template);
//     return compiledTemplate(data);
//   }

//   validate(): boolean {
//     // TODO add validation logic
//     return true;
//   }

//   adaptForLLM(prompt: string, options: LLMOptions): any {
//     const adapter = AdapterFactory.getAdapter(options.model);
//     return adapter.adapt(prompt, options);
//   }

//   getVersion(): string {
//     return this.version;
//   }
// }
