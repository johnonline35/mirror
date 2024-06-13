import { Module } from '@nestjs/common';
import { StructuredDataService } from './structured-data.service';
import { StructuredDataController } from './structured-data.controller';
import { JobManagerModule } from '../job-manager/job-manager.module';
import { ComponentsRegistryModule } from '../components-registry/components-registry.module';

@Module({
  imports: [JobManagerModule, ComponentsRegistryModule],
  controllers: [StructuredDataController],
  providers: [StructuredDataService],
  exports: [StructuredDataService],
})
export class StructuredDataModule {}
