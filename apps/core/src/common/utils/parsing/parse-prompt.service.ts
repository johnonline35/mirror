import { Injectable, Logger } from '@nestjs/common';
import { ValidatePromptContext } from '../../../workers/types/validate-prompt/validate-prompt.interface';

@Injectable()
export class ParsePromptService {
  private readonly logger = new Logger(ParsePromptService.name);

  parsePromptReview(context: ValidatePromptContext): {
    success?: boolean;
    feedback?: string;
  } {
    try {
      this.logger.log(
        'Received prompt review JSON:',
        JSON.stringify(context.promptReview),
      );

      const parsedReview = JSON.parse(context.promptReview);

      const findKeys = (obj: any, keys: string[]) => {
        const result: any = {};
        const helper = (obj: any) => {
          if (obj && typeof obj === 'object') {
            for (const key in obj) {
              if (keys.includes(key)) {
                result[key] = obj[key];
              }
              if (typeof obj[key] === 'object') {
                helper(obj[key]);
              }
            }
          }
        };
        helper(obj);
        return result;
      };

      const { success, feedback } = findKeys(parsedReview, [
        'success',
        'feedback',
      ]);

      if (success !== undefined) {
        return { success, feedback };
      } else {
        this.logger.error('Failed to parse success status from prompt review');
        return { feedback };
      }
    } catch (error) {
      this.logger.error('Failed to parse prompt review JSON', error);
      this.logger.error(
        `Invalid JSON: ${JSON.stringify(context.promptReview)}`,
      );
      return {};
    }
  }
}
