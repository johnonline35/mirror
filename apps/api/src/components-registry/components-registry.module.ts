import { Module } from '@nestjs/common';
import { ComponentsRegistryService } from './components-registry.service';
import { DiscoveryModule } from '@nestjs/core';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [DiscoveryModule, CommonModule],
  providers: [ComponentsRegistryService],
  exports: [ComponentsRegistryService],
})
export class ComponentsRegistryModule {}
