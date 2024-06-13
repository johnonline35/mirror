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
