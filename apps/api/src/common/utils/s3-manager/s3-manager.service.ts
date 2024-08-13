import { Injectable } from '@nestjs/common';
import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3ManagerService {
  constructor(private s3Client: S3Client) {}

  async listBucketContents(bucket: string): Promise<string[]> {
    const command = new ListObjectsV2Command({ Bucket: bucket });

    try {
      const response: ListObjectsV2CommandOutput =
        await this.s3Client.send(command);
      return response.Contents?.map((c) => c.Key) || [];
    } catch (error) {
      console.error('Error listing bucket contents:', error);
      throw error;
    }
  }
}
