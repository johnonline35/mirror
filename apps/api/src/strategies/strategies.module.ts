import { Module } from '@nestjs/common';
import { CrawlerStrategiesModule } from './crawler/crawler-strategy.module';

@Module({
  imports: [CrawlerStrategiesModule],
  exports: [CrawlerStrategiesModule],
})
export class StrategiesModule {}
