import { bootstrap } from './bootstrap';

bootstrap(false, true).then(async (nestApp) => {
  const port = process.env.PORT || 3334;
  return nestApp.listen(port);
});

// import { NestFactory } from '@nestjs/core';
// import { Logger } from '@nestjs/common';
// import { AppModule } from './app.module';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// // import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule, {
//     logger: ['log', 'error', 'warn', 'debug', 'verbose'],
//   });

//   // app.useGlobalFilters(new AllExceptionsFilter());

//   if (
//     process.env.NODE_ENV === 'development' ||
//     process.env.NODE_ENV === 'test'
//   ) {
//     const config = new DocumentBuilder()
//       .setTitle('Mirror Data')
//       .setDescription('Mirror Data API documentation')
//       .setVersion('1.0')
//       .addBearerAuth()
//       .addTag('mirror')
//       .build();
//     const document = SwaggerModule.createDocument(app, config);
//     SwaggerModule.setup('api', app, document);
//   }

//   Logger.log('Starting NestJS application...');
//   await app.listen(3000);
// }
// bootstrap();
