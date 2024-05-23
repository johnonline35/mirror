import { Module } from '@nestjs/common';
import { CrawlerStrategyFactory } from './crawler-strategies/crawler-strategy.factory';
import { OpenAiService } from '../llm/llms/openai/openai.service';
import { FallbackStrategy } from './crawler-strategies/strategies/fallback.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { UtilitiesModule } from '../utilities/utilities.module';

@Module({
  imports: [UtilitiesModule],
  providers: [
    CrawlerStrategyFactory,
    OpenAiService,
    FallbackStrategy,
    PrismaService,
  ],
  exports: [CrawlerStrategyFactory, FallbackStrategy],
})
export class StrategiesModule {}
