import { Injectable, Logger } from '@nestjs/common';
import { ValidatePromptContext } from '../../../agents/types/validate-prompt/validate-prompt.interface';

@Injectable()
export class ParsePromptService {
  private readonly logger = new Logger(ParsePromptService.name);

  parsePromptReview(context: ValidatePromptContext): {
    success?: boolean;
    feedback?: string;
  } {
    try {
      const parsedReview = JSON.parse(context.promptReview);

      const success = parsedReview.success;
      const feedback = parsedReview.feedback;

      if (success !== undefined) {
        return { success, feedback };
      } else {
        this.logger.error('Failed to parse success status from prompt review');
        return { feedback };
      }
    } catch (error) {
      this.logger.error('Failed to parse prompt review JSON', error);
      return {};
    }
  }
}
