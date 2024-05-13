import { Module } from '@nestjs/common';
import { CrawlerFactoryService } from './crawler-factory.service';
import { UtilitiesModule } from '../../utilities/utilities.module';

// import { FallbackStrategy } from './strategies/fallback.strategy';

@Module({
  imports: [UtilitiesModule],
  providers: [CrawlerFactoryService],
  exports: [CrawlerFactoryService],
})
export class CrawlerStrategiesModule {}
