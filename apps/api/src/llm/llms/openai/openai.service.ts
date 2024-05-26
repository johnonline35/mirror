import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionTool as OpenAIChatCompletionTool } from 'openai/resources/chat';
import {
  ChatCompletionMessageParam,
  ChatCompletionFunctionCallOption,
} from 'openai/resources';
import { PrismaService } from '../../../../prisma/prisma.service';
import { LLM, LLMOptions } from '../../llm.interface';

export type ChatCompletionTool = OpenAIChatCompletionTool;
export { ChatCompletionMessageParam, ChatCompletionFunctionCallOption };

@Injectable()
export class OpenAiService implements LLM {
  private openai: OpenAI;
  private readonly logger = new Logger(OpenAiService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  adapt(prompt: string, options?: LLMOptions) {
    return this.createCompletion([{ role: 'user', content: prompt }], options);
  }

  async createCompletion(
    messages: any[],
    options: LLMOptions = {},
  ): Promise<string> {
    const callerDetails = this.getCallerFunctionDetails();
    const startTime = Date.now();

    try {
      const response = await this.openai.chat.completions.create({
        model: options.model,
        messages,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
        stop: options.stopSequences,
      });

      const duration = Date.now() - startTime;
      const tokenUsage = response.usage;

      this.logger.log({
        message: 'Token usage',
        caller: callerDetails,
        tokenUsage: tokenUsage,
        options: options,
        duration: `${duration}ms`,
      });

      await this.logTokenUsage(
        messages,
        response.choices[0].message.content,
        tokenUsage,
        callerDetails,
        options,
        duration,
      );

      return response.choices[0].message.content.trim();
    } catch (error) {
      this.logger.error({
        message: 'Error calling OpenAI API',
        caller: callerDetails,
        error: error.message,
      });
      throw error;
    }
  }

  private async logTokenUsage(
    messages: any[],
    response: string,
    tokenUsage: any,
    caller: string,
    options: LLMOptions,
    duration: number,
  ) {
    try {
      await this.prisma.tokenUsage.create({
        data: {
          request_tokens: tokenUsage.prompt_tokens,
          response_tokens: tokenUsage.completion_tokens,
          total_tokens: tokenUsage.total_tokens,
          request_content: JSON.stringify(messages),
          response_content: response,
          endpoint: caller,
          options: JSON.stringify(options),
          duration: duration,
        },
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to log token usage',
        error: error.message,
      });
    }
  }

  private getCallerFunctionDetails(): string {
    const error = new Error();
    const stack = error.stack?.split('\n');
    const callerStackLine = stack ? stack[3] : '';
    const match = callerStackLine.match(
      /at\s+([^(]+)\s+\(([^:]+):(\d+):(\d+)\)/,
    );
    if (match && match.length > 1) {
      return `Function: ${match[1].trim()}, File: ${match[2]}, Line: ${match[3]}, Column: ${match[4]}`;
    }
    return `unknown, Full Stack: ${error.stack}`;
  }
}

// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import OpenAI from 'openai';
// import { PrismaService } from '../../../prisma/prisma.service';
// import { LLM, LLMOptions } from '../llm.interface';
// import { OpenAIModels } from '../llm.models';

// @Injectable()
// export class OpenAiService implements LLM {
//   private openai: OpenAI;
//   private readonly logger = new Logger(OpenAiService.name);

//   constructor(
//     private configService: ConfigService,
//     private prisma: PrismaService,
//   ) {
//     this.openai = new OpenAI({
//       apiKey: this.configService.get<string>('OPENAI_API_KEY'),
//     });
//   }

//   async createCompletion(
//     messages: any[],
//     options: LLMOptions = {},
//   ): Promise<string> {
//     const callerDetails = this.getCallerFunctionDetails();
//     const startTime = Date.now();

//     try {
//       const response = await this.openai.chat.completions.create({
//         model: (options.model as OpenAIModels) || 'gpt-3.5-turbo-0125',
//         messages: messages,
//         max_tokens: options.maxTokens,
//         temperature: options.temperature,
//         top_p: options.topP,
//         frequency_penalty: options.frequencyPenalty,
//         presence_penalty: options.presencePenalty,
//       });

//       const endTime = Date.now();
//       const duration = endTime - startTime;

//       const tokenUsage = response.usage;

//       this.logger.log({
//         message: 'Token usage',
//         caller: callerDetails,
//         tokenUsage: tokenUsage,
//         options: options,
//         duration: `${duration}ms`,
//       });

//       await this.logTokenUsage(
//         messages,
//         response.choices[0].message.content,
//         tokenUsage,
//         callerDetails,
//         options,
//         duration,
//       );

//       const result = response.choices[0].message.content.trim();
//       return result;
//     } catch (error) {
//       this.logger.error({
//         message: 'Error calling OpenAI API',
//         caller: callerDetails,
//         error: error.message,
//       });
//       // Implement retries or other error handling logic as needed
//       throw error;
//     }
//   }

//   async summarizeHomepageText(text: string): Promise<string> {
//     const messages = [
//       {
//         role: 'system',
//         content:
//           'You are a helpful assistant that is able to understand the context of words on a web page and describe in simple sentences what each part of the text on a page is meant to do. Also describe the core features of the business that the page represents - how does it likely make money?',
//       },
//       {
//         role: 'user',
//         content: `Please summarize the following content to make it readable and meaningful, removing redundant or unhelpful words: ${text}`,
//       },
//     ];

//     const summary = await this.createCompletion(messages, {
//       model: 'gpt-3.5-turbo-0125',
//       maxTokens: 400,
//       temperature: 0.5,
//     });

//     return summary;
//   }

//   private async logTokenUsage(
//     messages: any[],
//     response: string,
//     tokenUsage: any,
//     caller: string,
//     options: LLMOptions,
//     duration: number,
//   ) {
//     try {
//       await this.prisma.tokenUsage.create({
//         data: {
//           request_tokens: tokenUsage.prompt_tokens,
//           response_tokens: tokenUsage.completion_tokens,
//           total_tokens: tokenUsage.total_tokens,
//           request_content: JSON.stringify(messages),
//           response_content: response,
//           endpoint: caller,
//           options: JSON.stringify(options),
//           duration: duration,
//         },
//       });
//     } catch (error) {
//       this.logger.error({
//         message: 'Failed to log token usage',
//         error: error.message,
//       });
//       // Consider handling this error differently if necessary
//     }
//   }

//   private getCallerFunctionDetails(): string {
//     const error = new Error();
//     const stack = error.stack?.split('\n');
//     const callerStackLine = stack ? stack[3] : '';
//     const match = callerStackLine.match(
//       /at\s+([^(]+)\s+\(([^:]+):(\d+):(\d+)\)/,
//     );
//     if (match && match.length > 1) {
//       const functionName = match[1].trim();
//       const fileName = match[2];
//       const lineNumber = match[3];
//       const columnNumber = match[4];
//       return `Function: ${functionName}, File: ${fileName}, Line: ${lineNumber}, Column: ${columnNumber}`;
//     }
//     return `unknown, Full Stack: ${error.stack}`;
//   }
// }
