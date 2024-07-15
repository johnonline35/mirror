import { Injectable } from '@nestjs/common';
import { BaseTemplate } from './baseTemplate';
import { TemplateFactory } from './ templateFactory';
import { templateTypes } from './templateRegistry';

@Injectable()
export class TemplatesService {
  getClassificationTemplate(version: string): BaseTemplate {
    return this.getTemplate(templateTypes.CLASSIFICATION, version);
  }

  getSummarizationTemplate(version: string): BaseTemplate {
    return this.getTemplate(templateTypes.HOMEPAGE_SUMMARIZATION, version);
  }

  getPromptReviewTemplate(version: string): BaseTemplate {
    return this.getTemplate(templateTypes.PROMPT_REVIEW, version);
  }

  getSiteCrawlPlanTemplate(version: string): BaseTemplate {
    return this.getTemplate(templateTypes.SITE_CRAWL_PLAN, version);
  }

  getReflectionTemplate(version: string): BaseTemplate {
    return this.getTemplate(templateTypes.REFLECTION, version);
  }

  getDataExtractionTemplate(version: string): BaseTemplate {
    return this.getTemplate(templateTypes.STRUCTURED_DATA_EXTRACTION, version);
  }

  getDataReviewTemplate(version: string): BaseTemplate {
    return this.getTemplate(templateTypes.STRUCTURED_REVIEWED_DATA, version);
  }

  private getTemplate(
    type: (typeof templateTypes)[keyof typeof templateTypes],
    version: string,
  ): BaseTemplate {
    return TemplateFactory.createTemplate(type, version);
  }
}
