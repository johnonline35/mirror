import { Injectable } from '@nestjs/common';
import { BaseTemplate } from './baseTemplate';
import { TemplateFactory } from './ templateFactory';

@Injectable()
export class TemplatesService {
  getClassificationTemplate(version: string): BaseTemplate {
    return TemplateFactory.createTemplate('CLASSIFICATION', version);
  }

  getSummarizationTemplate(version: string): BaseTemplate {
    return TemplateFactory.createTemplate('HOMEPAGE_SUMMARIZATION', version);
  }

  getPromptReviewTemplate(version: string): BaseTemplate {
    return TemplateFactory.createTemplate('PROMPT_REVIEW', version);
  }
}
