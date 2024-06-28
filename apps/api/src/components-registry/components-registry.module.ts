import { Module } from '@nestjs/common';
import { ComponentsRegistryService } from './components-registry.service';
import { DiscoveryModule } from '@nestjs/core';
import { CommonModule } from '../common/common.module';
import { getTaskComponentProviders } from './components-registry.decorator';
import { CrawlerModule } from '../tools/crawler/crawler.module';

@Module({
  imports: [DiscoveryModule, CommonModule, CrawlerModule],
  providers: [ComponentsRegistryService, ...getTaskComponentProviders()],
  exports: [ComponentsRegistryService],
})
export class ComponentsRegistryModule {}
