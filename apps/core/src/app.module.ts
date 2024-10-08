import { Module } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { CrawlerModule } from './tools/crawler/crawler.module';
import { LlmModule } from './llm/llm.module';
import { UtilitiesModule } from './common/utils/utilities.module';
import { CommonModule } from './common/common.module';
import { WorkersModule } from './workers/workers.module';
import { TaskDispatcherModule } from './task-dispatcher/task-dispatcher.module';
import { WorkflowModule } from './workflows/workflow.module';
import { JobManagerModule } from './job-manager/job-manager.module';
import { StructuredDataModule } from './endpoints/structured-data-agent/structured-data.module';
import { ToolsModule } from './tools/tools.module';
import { ComponentsRegistryModule } from './components-registry/components-registry.module';
// import { S3ManagerModule } from './common/utils/s3-manager/s3-manager.module';
import { LambdaModule } from './lambda/lambda.module';
// import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';
// import { PrismaService } from './common/utils/prisma/prisma.service';
import { DevtoolsModule } from '@nestjs/devtools-integration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    // S3ManagerModule,
    ComponentsRegistryModule,
    UtilitiesModule,
    CommonModule,
    ToolsModule,
    CrawlerModule,
    LlmModule,
    WorkersModule,
    WorkflowModule,
    TaskDispatcherModule,
    JobManagerModule,
    StructuredDataModule,
    LambdaModule,
    // GracefulShutdownModule.forRoot({
    //   cleanup: async (a) => {
    //     await a.get(PrismaService).$disconnect();
    //   },
    // }),
  ],
  controllers: [AppController],
  providers: [DiscoveryService],
})
export class AppModule {}
