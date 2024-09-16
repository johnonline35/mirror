import { SetMetadata } from '@nestjs/common';

export enum WorkerType {
  CrawlPageWorker = 'CRAWL_PAGE_WORKER',
  CrawlSitePlanningWorker = 'CRAWL_SITE_PLANNING_WORKER',
  DataExtractionAndInferenceWorker = 'DATA_EXTRACTION_AND_INFERENCE_WORKER',
  DataReviewWorker = 'DATA_REVIEW_WORKER',
  ReflectionWorker = 'REFLECTION_WORKER',
  ValidatePromptWorker = 'VALIDATE_PROMPT_WORKER',
}

export const WORKER_METADATA_KEY = 'WORKER_METADATA_KEY';

export const RegisterWorker = (workerType: WorkerType) =>
  SetMetadata(WORKER_METADATA_KEY, workerType);
