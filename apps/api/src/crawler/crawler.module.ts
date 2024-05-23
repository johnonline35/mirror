import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CrawlerStrategyFactory } from '../strategies/crawler-strategies/crawler-strategy.factory';
import { OpenAiService } from '../llm/llms/openai/openai.service';
import { FallbackStrategy } from '../strategies/crawler-strategies/strategies/fallback.strategy';
import { UtilitiesModule } from '../utilities/utilities.module';
import { StrategiesModule } from '../strategies/strategies.module';
import { CrawlerController } from './crawler.controller';

@Module({
  controllers: [CrawlerController],
  imports: [PrismaModule, UtilitiesModule, StrategiesModule],
  providers: [
    FallbackStrategy,
    CrawlerService,
    CrawlerStrategyFactory,
    OpenAiService,
  ],
  exports: [CrawlerService],
})
export class CrawlerModule {}
