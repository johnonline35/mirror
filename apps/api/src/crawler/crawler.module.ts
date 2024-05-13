import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { DataPreprocessorModule } from '../data-preprocessor/data-preprocessor.module';
import { UtilitiesModule } from '../utilities/utilities.module';
import { CrawlerFactoryService } from '../strategies/crawler/crawler-factory.service';
// import { CrawlerController } from './crawler.controller';

@Module({
  imports: [PrismaModule, DataPreprocessorModule, UtilitiesModule],
  providers: [CrawlerService, CrawlerFactoryService],
  exports: [CrawlerService],
})
export class CrawlerModule {}
