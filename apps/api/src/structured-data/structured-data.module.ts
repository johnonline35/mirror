import { Module } from '@nestjs/common';
import { StructuredDataService } from './structured-data.service';
import { StructuredDataController } from './structured-data.controller';
import { JobManagerModule } from '../job-manager/job-manager.module';

@Module({
  imports: [JobManagerModule],
  controllers: [StructuredDataController],
  providers: [StructuredDataService],
})
export class StructuredDataModule {}
