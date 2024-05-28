import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('Initializing NestJS application...');

  app.useGlobalFilters(new AllExceptionsFilter());

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Mirror Data')
      .setDescription('Mirror Data API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('mirror')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }
  await app.listen(3000);
}
bootstrap();
