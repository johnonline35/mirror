import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { S3ManagerService } from './s3-manager.service';

@Module({
  providers: [
    {
      provide: S3Client,
      useValue: new S3Client({ region: process.env.AWS_REGION || 'us-east-1' }),
    },
    S3ManagerService,
  ],
  exports: [S3ManagerService],
})
export class S3ManagerModule {}
