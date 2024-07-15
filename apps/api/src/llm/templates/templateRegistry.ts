import { BaseTemplate } from './baseTemplate';
import { CategoryClassificationTemplate } from './classification/categoryClassificationTemplate';
import { SiteCrawlPlanTemplate } from './agent-behaviors/planning/siteCrawlPlanTemplate';
import { HomePageSummarizationTemplate } from './summarization/contentSummarizationTemplate';
import { PromptReviewTemplate } from './validation/promptReviewTemplate';
import { ReflectionTemplate } from './agent-behaviors/reflection/reflectionTemplate';
import { StructuredDataExtractionTemplate } from './extraction/structuredDataExtractionTemplate';
import { StructuredReviewedDataTemplate } from './final-output/structuredReviewedData';

export const templateTypes = {
  CLASSIFICATION: 'CLASSIFICATION',
  STRUCTURED_DATA_EXTRACTION: 'STRUCTURED_DATA_EXTRACTION',
  STRUCTURED_REVIEWED_DATA: 'STRUCTURED_REVIEWED_DATA',
  HOMEPAGE_SUMMARIZATION: 'HOMEPAGE_SUMMARIZATION',
  PROMPT_REVIEW: 'PROMPT_REVIEW',
  REFLECTION: 'REFLECTION',
  SITE_CRAWL_PLAN: 'SITE_CRAWL_PLAN',
} as const;

type TemplateType = (typeof templateTypes)[keyof typeof templateTypes];

type TemplateConstructor = (version?: string) => BaseTemplate;

export const templateMap: Record<TemplateType, TemplateConstructor> = {
  [templateTypes.HOMEPAGE_SUMMARIZATION]: HomePageSummarizationTemplate.create,
  [templateTypes.STRUCTURED_REVIEWED_DATA]:
    StructuredReviewedDataTemplate.create,
  [templateTypes.STRUCTURED_DATA_EXTRACTION]:
    StructuredDataExtractionTemplate.create,
  [templateTypes.CLASSIFICATION]: CategoryClassificationTemplate.create,
  [templateTypes.PROMPT_REVIEW]: PromptReviewTemplate.create,
  [templateTypes.REFLECTION]: ReflectionTemplate.create,
  [templateTypes.SITE_CRAWL_PLAN]: SiteCrawlPlanTemplate.create,
};
