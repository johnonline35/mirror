import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { QuietStartupLogger } from './quiet-logger';

export async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: new QuietStartupLogger(true),
  });

  return app;
}
