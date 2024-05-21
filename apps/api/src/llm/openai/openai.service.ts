import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async getResponseFromMessages_50TokenLimit(messages: any[]): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-2024-05-13',
        messages: messages,
        max_tokens: 50,
        temperature: 0,
      });

      const result = response.choices[0].message.content.trim();
      return result;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
}
