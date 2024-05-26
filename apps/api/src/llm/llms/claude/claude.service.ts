import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { LLM, LLMOptions } from '../../llm.interface';
import { AnthropicModels } from '../../llm.models';

@Injectable()
export class ClaudeService implements LLM {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  adapt(prompt: string, options?: LLMOptions) {
    throw new Error('Method not implemented.');
  }

  async createCompletion(
    messages: any[],
    options: LLMOptions = {},
  ): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: (options.model as AnthropicModels) || 'claude-3-haiku-20240307',
        max_tokens: options.maxTokens || 50,
        messages: messages,
        temperature: options.temperature || 0,
      });

      // Concatenate the text from all content blocks
      const result = response.content
        .map((block) => block.text)
        .join(' ')
        .trim();
      return result;
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      throw error;
    }
  }
}
