import { INestApplication } from '@nestjs/common';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import {
  APIGatewayProxyEvent,
  S3Event,
  SQSRecord,
  SQSEvent,
  Context,
  Handler,
  Callback,
} from 'aws-lambda';
import { bootstrap } from './bootstrap';
import warmer from 'lambda-warmer';
import { JobManagerService } from './job-manager/job-manager.service';

let nestApp: INestApplication;
let server: Handler;

type HandlerEvent =
  | APIGatewayProxyEvent
  | S3Event
  | SQSEvent
  | { [key: string]: any };

export const handler: Handler = async (
  event: HandlerEvent,
  context: Context,
  callback: Callback,
) => {
  if (!nestApp) {
    nestApp = await bootstrap(false, false);
  }

  if (await warmer(event)) return 'warmed';

  // Check if the event is an SQS event
  if (isSQSEvent(event)) {
    return handleSQSEvents(event.Records);
  }

  // API Gateway Handling
  if (!server) {
    await nestApp.init();
    const expressApp = nestApp.getHttpAdapter().getInstance();
    server = serverlessExpress({ app: expressApp });
  }

  return server(event, context, callback);
};

// Type guard to check if the event is an SQS event
function isSQSEvent(event: HandlerEvent): event is SQSEvent {
  return (
    (event as SQSEvent).Records !== undefined &&
    (event as SQSEvent).Records[0].eventSource === 'aws:sqs'
  );
}

// Function to handle SQS events
async function handleSQSEvents(records: SQSRecord[]): Promise<void> {
  const jobManagerService = nestApp.get(JobManagerService);

  for (const record of records) {
    const { jobId, task } = JSON.parse(record.body);
    try {
      await jobManagerService.executeJobInBackground(jobId, task);
      console.log(`Successfully processed job ${jobId}`);
    } catch (error) {
      console.error(`Failed to process job ${jobId}:`, error);
    }
  }
}

// import { INestApplication } from '@nestjs/common';
// import { configure as serverlessExpress } from '@vendia/serverless-express';
// import {
//   APIGatewayProxyEvent,
//   S3Event,
//   Context,
//   Handler,
//   Callback,
// } from 'aws-lambda';
// import { bootstrap } from './bootstrap';
// import warmer from 'lambda-warmer';
// // import { QuietStartupLogger } from './quiet-logger';

// let nestApp: INestApplication;
// let server: Handler;

// type HandlerEvent = APIGatewayProxyEvent | S3Event | { [key: string]: any };

// export const handler: Handler = async (
//   event: HandlerEvent,
//   context: Context,
//   callback: Callback,
// ) => {
//   if (!nestApp) {
//     nestApp = await bootstrap(false, false);
//   }

//   if (await warmer(event)) return 'warmed';

//   if (!server) {
//     await nestApp.init();
//     const expressApp = nestApp.getHttpAdapter().getInstance();
//     server = serverlessExpress({ app: expressApp });
//   }

//   return server(event, context, callback);
// };
