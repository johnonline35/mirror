import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { LlmModule } from '../llm/llm.module';
import { ToolsModule } from '../tools/tools.module';
import { WorkersService } from './workers.service';
import { DiscoveryModule } from '@nestjs/core';
import { ValidatePromptWorker } from './types/validate-prompt/validate-prompt.worker';
import { CrawlPageWorker } from './types/crawl-page/crawl-page.worker';
import { CrawlSitePlanningWorker } from './types/crawl-site-planning/crawl-site-planning.worker';
import { DataExtractionAndInferenceWorker } from './types/data-extraction-and-inference/data-extraction-and-inference.worker';
import { DataReviewWorker } from './types/data-review/data-review.worker';

@Module({
  imports: [DiscoveryModule, CommonModule, LlmModule, ToolsModule],
  providers: [
    WorkersService,
    ValidatePromptWorker,
    CrawlPageWorker,
    CrawlSitePlanningWorker,
    DataExtractionAndInferenceWorker,
    DataReviewWorker,
  ],
  exports: [WorkersService],
})
export class WorkersModule {}
