import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
// import { DocumentBuilder } from '@nestjs/swagger';
import bodyParser from 'body-parser';
import { Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { QuietStartupLogger } from './quiet-logger';
// import { setupGracefulShutdown } from 'nestjs-graceful-shutdown';

export async function bootstrap(
  enableOpenApi: boolean,
  debugRequestsLogger?: boolean,
) {
  // CORS is enabled
  const app = await NestFactory.create(AppModule, {
    cors: true,
    snapshot: true,
    logger: new QuietStartupLogger(true),
    bodyParser: false,
  });

  const rawBodyBuffer = (req, res, buffer, encoding) => {
    if (!req.headers['stripe-signature']) {
      return;
    }

    if (buffer && buffer.length) {
      req.rawBody = buffer.toString(encoding || 'utf8');
    }
  };

  app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
  app.use(bodyParser.json({ limit: 2000000, verify: rawBodyBuffer }));

  if (debugRequestsLogger) {
    app.use((request: any, response: Response, next: any) => {
      const { ip, method, path: url } = request;
      const userAgent = request.get('user-agent') || '';

      response.on('close', () => {
        const { statusCode } = response;
        const contentLength = response.get('content-length');

        Logger.log(
          `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
        );
      });

      next();
    });
  }

  // Helmet Middleware against known security vulnerabilities
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // TODO: we should be smarter about this
          defaultSrc: `* 'unsafe-inline' 'unsafe-eval' 'unsafe-dynamic'`,
          // scriptSrc: `'self' 'localhost:3333'`,
          // styleSrc: `'self' 'unsafe-inline' 'fonts.googleapis.com'`,
        },
      },
    }),
  );

  if (enableOpenApi) {
    console.log('enableOpenApi is enabled but code isnt here', enableOpenApi);
    // const { OpenApiNestFactory } = await import('nest-openapi-tools');

    // // content="default-src 'self';
    // // script-src 'self' https://aframe.io;
    // // style-src 'self' 'unsafe-inline';"
    // // Swagger API Documentation
    // const options = new DocumentBuilder()
    //   .setTitle('Zipper Screenshot API')
    //   .setDescription('API for generating screenshots from a URL')
    //   .setVersion('0.1.0')
    //   .addBearerAuth();
    // await OpenApiNestFactory.configure(
    //   app as any, // TODO: wtf?
    //   options,
    //   {
    //     webServerOptions: {
    //       enabled: enableOpenApi,
    //       path: 'apidocs',
    //     },
    //     fileGeneratorOptions: {
    //       enabled: enableOpenApi,
    //       outputFilePath: './openapi.yaml', // or ./openapi.json
    //     },
    //     clientGeneratorOptions: {
    //       enabled: enableOpenApi,
    //       type: 'typescript-fetch',
    //       outputFolderPath: '../../libs/screenshot-api-client-typescript/src',
    //       additionalProperties:
    //         'apiPackage=clients,modelPackage=models,withoutPrefixEnums=true,withSeparateModelsAndApi=true',
    //       openApiFilePath: './openapi.yaml', // or ./openapi.json
    //       skipValidation: true, // optional, false by default
    //     },
    //   },
    //   {
    //     extraModels: [],
    //     operationIdFactory: (c: string, method: string) => method,
    //   },
    // );
  }

  // Request Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // setupGracefulShutdown({ app });

  return app;
}
