import { BaseTemplate } from './baseTemplate';
import { HomePageSummarizationTemplate } from './summarization/contentSummarizationTemplate';

export class TemplateFactory {
  static createTemplate(type: string, version?: string): BaseTemplate {
    switch (type) {
      case 'HOMEPAGE_SUMMARIZATION':
        return HomePageSummarizationTemplate.create(version);
      // Add other cases for different templates
      default:
        throw new Error(`Unknown template type: ${type}`);
    }
  }
}
