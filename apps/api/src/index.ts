import { INestApplication } from '@nestjs/common';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import {
  APIGatewayProxyEvent,
  S3Event,
  Context,
  Handler,
  Callback,
} from 'aws-lambda';
import { bootstrap } from './bootstrap';
import warmer from 'lambda-warmer';
// import { QuietStartupLogger } from './quiet-logger';

let nestApp: INestApplication;
let server: Handler;

type HandlerEvent = APIGatewayProxyEvent | S3Event | { [key: string]: any };

export const handler: Handler = async (
  event: HandlerEvent,
  context: Context,
  callback: Callback,
) => {
  if (!nestApp) {
    nestApp = await bootstrap(false, false);
  }

  if (await warmer(event)) return 'warmed';

  if (!server) {
    await nestApp.init();
    const expressApp = nestApp.getHttpAdapter().getInstance();
    server = serverlessExpress({ app: expressApp });
  }

  return server(event, context, callback);
};
