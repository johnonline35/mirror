import { BaseTemplate } from './baseTemplate';
import { templateMap, templateTypes } from './templateRegistry';

export class TemplateFactory {
  static createTemplate(
    type: (typeof templateTypes)[keyof typeof templateTypes],
    version?: string,
  ): BaseTemplate {
    const templateConstructor = templateMap[type];
    if (!templateConstructor) {
      throw new Error(`Unknown template type: ${type}`);
    }
    return templateConstructor(version);
  }
}

// import { BaseTemplate } from './baseTemplate';
// import { CategoryClassificationTemplate } from './classification/categoryClassificationTemplate';
// import { SiteCrawlPlanTemplate } from './planning/siteCrawlPlanTemplate';
// import { HomePageSummarizationTemplate } from './summarization/contentSummarizationTemplate';
// import { PromptReviewTemplate } from './validation/promptReviewTemplate';

// export class TemplateFactory {
//   static createTemplate(type: string, version?: string): BaseTemplate {
//     switch (type) {
//       case 'HOMEPAGE_SUMMARIZATION':
//         return HomePageSummarizationTemplate.create(version);
//       case 'CLASSIFICATION':
//         return CategoryClassificationTemplate.create(version);
//       case 'PROMPT_REVIEW':
//         return PromptReviewTemplate.create(version);
//       case 'SITE_CRAWL_PLAN':
//         return SiteCrawlPlanTemplate.create(version);
//       default:
//         throw new Error(`Unknown template type: ${type}`);
//     }
//   }
// }
