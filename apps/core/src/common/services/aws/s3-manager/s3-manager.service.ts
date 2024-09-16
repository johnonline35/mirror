import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

  async uploadToS3(bucket: string, key: string, data: any): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
    });

    try {
      // Upload the file
      const response = await this.s3Client.send(command);
      console.log('S3 upload response:', response);
      // Generate a pre-signed URL for the uploaded file
      return await this.getPreSignedUrl(bucket, key);
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  async getPreSignedUrl(bucket: string, key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    // Generate the pre-signed URL that expires in 1 hour (3600 seconds)
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
