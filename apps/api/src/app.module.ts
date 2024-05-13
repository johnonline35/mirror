import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlerModule } from './crawler/crawler.module';
import { PrismaService } from '../prisma/prisma.service';
import { DataPreprocessorModule } from './data-preprocessor/data-preprocessor.module';
import { StrategiesModule } from './strategies/strategies.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { LlmModule } from './llm/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    CrawlerModule,
    DataPreprocessorModule,
    StrategiesModule,
    UtilitiesModule,
    LlmModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
