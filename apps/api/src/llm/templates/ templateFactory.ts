import { BaseTemplate } from './baseTemplate';
import { CategoryClassificationTemplate } from './classification/categoryClassificationTemplate';
import { HomePageSummarizationTemplate } from './summarization/contentSummarizationTemplate';

export class TemplateFactory {
  static createTemplate(type: string, version?: string): BaseTemplate {
    switch (type) {
      case 'HOMEPAGE_SUMMARIZATION':
        return HomePageSummarizationTemplate.create(version);
      case 'CLASSIFICATION':
        return CategoryClassificationTemplate.create(version);
      default:
        throw new Error(`Unknown template type: ${type}`);
    }
  }
}
