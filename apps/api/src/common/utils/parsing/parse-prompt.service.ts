import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ParsePromptService {
  private readonly logger = new Logger(ParsePromptService.name);

  parsePromptReview(promptReview: string): {
    success?: boolean;
    feedback?: string;
  } {
    const successRegex = /success:\s*(true|false)/i;
    const feedbackRegex = /feedback:\s*(.*)/i;

    const successMatch = promptReview.match(successRegex);
    const feedbackMatch = promptReview.match(feedbackRegex);

    if (successMatch) {
      const success = successMatch[1].toLowerCase() === 'true';
      const feedback = feedbackMatch ? feedbackMatch[1].trim() : undefined;
      return { success, feedback };
    } else {
      this.logger.error('Failed to parse success status from prompt review');
      const feedback = feedbackMatch ? feedbackMatch[1].trim() : undefined;
      return { feedback };
    }
  }
}
