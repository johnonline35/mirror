import { Module } from '@nestjs/common';
import { CrawlHomepageService } from './crawler.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { CrawlerStrategyFactory } from './strategies/crawler-strategy.factory';
import { OpenAiService } from '../../llm/llms/openai/openai.service';
import { FallbackStrategy } from './strategies/crawler-strategies/fallback.strategy';
import { UtilitiesModule } from '../../utilities/utilities.module';
import { StrategiesModule } from './strategies/strategies.module';
import { CrawlerController } from './crawler.controller';
import { TemplatesService } from '../../llm/templates/templates.service';
import { AdaptersService } from '../../llm/adapters/adapters.service';

@Module({
  controllers: [CrawlerController],
  imports: [PrismaModule, UtilitiesModule, StrategiesModule],
  providers: [
    FallbackStrategy,
    CrawlHomepageService,
    CrawlerStrategyFactory,
    OpenAiService,
    TemplatesService,
    AdaptersService,
  ],
  exports: [CrawlHomepageService],
})
export class CrawlerModule {}
