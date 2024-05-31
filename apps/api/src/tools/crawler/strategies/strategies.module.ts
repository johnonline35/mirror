import { Module } from '@nestjs/common';
import { CrawlerStrategyFactory } from './crawler-strategy.factory';
import { OpenAiService } from '../../../llm/llms/openai/openai.service';
import { FallbackStrategy } from './crawler-strategies/fallback.strategy';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UtilitiesModule } from '../../../utilities/utilities.module';
import { TemplatesService } from '../../../llm/templates/templates.service';
import { AdaptersService } from '../../../llm/adapters/adapters.service';

@Module({
  imports: [UtilitiesModule],
  providers: [
    CrawlerStrategyFactory,
    OpenAiService,
    FallbackStrategy,
    PrismaService,
    TemplatesService,
    AdaptersService,
  ],
  exports: [CrawlerStrategyFactory, FallbackStrategy],
})
export class StrategiesModule {}
