import { Injectable } from '@nestjs/common';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

@Injectable()
export class LambdaService {
  private lambdaClient: LambdaClient;

  constructor() {
    this.lambdaClient = new LambdaClient({ region: 'us-east-1' });
  }

  async invokeLambda(functionName: string, payload: any): Promise<any> {
    const lambdaPayload = {
      body: JSON.stringify(payload),
    };

    // console.log('Sending payload to Lambda:', JSON.stringify(lambdaPayload));

    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify(lambdaPayload),
    });

    try {
      const response = await this.lambdaClient.send(command);

      if (!response.Payload) {
        throw new Error('Lambda function returned no payload');
      }

      const result = JSON.parse(Buffer.from(response.Payload).toString());
      // console.log('Lambda response:', result);

      if (result.statusCode >= 400) {
        throw new Error(`Lambda error: ${result.body}`);
      }

      return JSON.parse(result.body);
    } catch (error) {
      console.error('Error invoking Lambda:', error);
      throw error;
    }
  }
}
