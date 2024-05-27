import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlerModule } from './crawler/crawler.module';
import { StrategiesModule } from './crawler/strategies/strategies.module';
import { LlmModule } from './llm/llm.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { CommonModule } from './common/common.module';
import { AgentsModule } from './agents/agents.module';
import { LoggingMiddleware } from './common/middlewares/logging.middleware';
import { WorkflowsModule } from './workflows/workflows.module';

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
    WorkflowsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
