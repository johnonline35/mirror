import { Injectable, Logger } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);

  constructor(private readonly sqsClient: SQSClient) {}

  async sendMessage(queueUrl: string, messageBody: string): Promise<void> {
    try {
      const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: messageBody,
      });

      await this.sqsClient.send(command);
      this.logger.log('Message successfully sent to SQS.');
    } catch (error) {
      this.logger.error('Failed to send message to SQS', error);
      throw error;
    }
  }
}
