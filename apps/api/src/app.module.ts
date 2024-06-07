import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlerModule } from './tools/crawler/crawler.module';
import { StrategiesModule } from './tools/crawler/strategies/strategies.module';
import { LlmModule } from './llm/llm.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { CommonModule } from './common/common.module';
import { AgentsModule } from './agents/agents.module';
import { TaskDispatcherService } from './task-dispatcher/task-dispatcher.service';
import { TaskDispatcherModule } from './task-dispatcher/task-dispatcher.module';
import { WorkflowModule } from './workflow/workflow.module';
import { JobManagerService } from './job-manager/job-manager.service';
import { JobManagerModule } from './job-manager/job-manager.module';
import { StructuredDataModule } from './structured-data/structured-data.module';
import { ToolsModule } from './tools/tools.module';
import { ComponentsRegistryService } from './components-registry/components-registry.service';
import { ComponentsRegistryModule } from './components-registry/components-registry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    UtilitiesModule,
    StrategiesModule,
    LlmModule,
    CrawlerModule,
    CommonModule,
    AgentsModule,
    ConfigModule,
    WorkflowModule,
    TaskDispatcherModule,
    JobManagerModule,
    StructuredDataModule,
    ToolsModule,
    ComponentsRegistryModule,
  ],
  controllers: [AppController],
  providers: [AppService, TaskDispatcherService, JobManagerService, ComponentsRegistryService],
})
export class AppModule {}
