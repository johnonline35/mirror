import { Module } from '@nestjs/common';
import { UtilitiesModule } from '../common/utils/utilities.module';
import { ComponentsRegistryModule } from '../components-registry/components-registry.module';
import { CommonModule } from '../common/common.module';
import { CrawlerModule } from './crawler/crawler.module';

@Module({
  imports: [
    CrawlerModule,
    UtilitiesModule,
    ComponentsRegistryModule,
    CommonModule,
  ],
  exports: [CrawlerModule],
})
export class ToolsModule {}
