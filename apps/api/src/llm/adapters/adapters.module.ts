import { Module } from '@nestjs/common';
import { AdaptersService } from './adapters.service';

@Module({
  providers: [AdaptersService],
  exports: [AdaptersService],
})
export class AdaptersModule {}
