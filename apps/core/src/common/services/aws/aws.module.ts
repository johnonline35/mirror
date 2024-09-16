import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';
import { S3ManagerService } from './s3-manager/s3-manager.service';
import { SqsService } from './sqs/sqs.service';

@Module({
  providers: [
    {
      provide: S3Client,
      useValue: new S3Client({ region: process.env.AWS_REGION || 'us-east-1' }),
    },
    {
      provide: SQSClient,
      useValue: new SQSClient({
        region: process.env.AWS_REGION || 'us-east-1',
      }),
    },
    S3ManagerService,
    SqsService,
  ],
  exports: [S3ManagerService, SqsService],
})
export class AWSModule {}
