import { Module } from '@nestjs/common';
import { CrawlHomepageService } from './crawler.service';
import { PrismaModule } from '../../../prisma/prisma.module';
// import { CrawlerStrategyFactory } from './strategies/crawler-strategy.factory';
import { OpenAiService } from '../../llm/llms/openai/openai.service';
// import { FallbackStrategy } from './strategies/crawler-strategies/fallback.strategy';
import { UtilitiesModule } from '../../common/utils/utilities.module';
// import { StrategiesModule } from './strategies/strategies.module';
// import { CrawlerController } from './crawler.controller';
import { TemplatesService } from '../../llm/templates/templates.service';
import { AdaptersService } from '../../llm/adapters/adapters.service';
import { CommonModule } from '../../common/common.module';
import { CachingService } from '../../common/caching/redis-cache/redis-cache.service';
import { ComponentsRegistryModule } from '../../components-registry/components-registry.module';

@Module({
  imports: [
    PrismaModule,
    UtilitiesModule,
    CommonModule,
    ComponentsRegistryModule,
  ],
  providers: [
    CrawlHomepageService,
    OpenAiService,
    TemplatesService,
    AdaptersService,
    CachingService,
  ],
  exports: [CrawlHomepageService],
})
export class CrawlerModule {}
