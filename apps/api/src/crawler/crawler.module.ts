import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CrawlerStrategyFactory } from './strategies/crawler-strategy.factory';
import { OpenAiService } from '../llm/llms/openai/openai.service';
import { FallbackStrategy } from './strategies/crawler-strategies/fallback.strategy';
import { UtilitiesModule } from '../utilities/utilities.module';
import { StrategiesModule } from './strategies/strategies.module';
import { CrawlerController } from './crawler.controller';
import { TemplatesService } from '../llm/templates/templates.service';
import { AdaptersService } from '../llm/adapters/adapters.service';

@Module({
  controllers: [CrawlerController],
  imports: [PrismaModule, UtilitiesModule, StrategiesModule],
  providers: [
    FallbackStrategy,
    CrawlerService,
    CrawlerStrategyFactory,
    OpenAiService,
    TemplatesService,
    AdaptersService,
  ],
  exports: [CrawlerService],
})
export class CrawlerModule {}
