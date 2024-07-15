import { Module } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlerModule } from './tools/crawler/crawler.module';
import { LlmModule } from './llm/llm.module';
import { UtilitiesModule } from './common/utils/utilities.module';
import { CommonModule } from './common/common.module';
import { AgentsModule } from './agents/agents.module';
import { TaskDispatcherModule } from './task-dispatcher/task-dispatcher.module';
import { WorkflowModule } from './workflow/workflow.module';
import { JobManagerModule } from './job-manager/job-manager.module';
import { StructuredDataModule } from './structured-data/structured-data.module';
import { ToolsModule } from './tools/tools.module';
import { ComponentsRegistryModule } from './components-registry/components-registry.module';
import { S3ManagerModule } from './common/utils/s3-manager/s3-manager.module';
import { S3, SharedIniFileCredentials } from 'aws-sdk';
import { AwsSdkModule } from 'nest-aws-sdk';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    S3ManagerModule,
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        region: 'us-east-1',
        credentials: new SharedIniFileCredentials({
          profile: 'default', // Use the default profile from ~/.aws/credentials
        }),
      },
      services: [S3],
    }),
    ComponentsRegistryModule,
    UtilitiesModule,
    CommonModule,
    ToolsModule,
    CrawlerModule,
    LlmModule,
    AgentsModule,
    WorkflowModule,
    TaskDispatcherModule,
    JobManagerModule,
    StructuredDataModule,
  ],
  controllers: [AppController],
  providers: [AppService, DiscoveryService],
})
export class AppModule {}
