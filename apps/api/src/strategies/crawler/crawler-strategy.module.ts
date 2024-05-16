import { Module } from '@nestjs/common';
import { CrawlerFactoryService } from './crawler-factory.service';
import { UtilitiesModule } from '../../utilities/utilities.module';
import { OpenAiService } from '../../llm/openai/openai.service';

// import { FallbackStrategy } from './strategies/fallback.strategy';

@Module({
  imports: [UtilitiesModule],
  providers: [CrawlerFactoryService, OpenAiService],
  exports: [CrawlerFactoryService],
})
export class CrawlerStrategiesModule {}
