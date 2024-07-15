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
      // Log the received JSON string for debugging
      this.logger.log(`Received prompt review JSON: ${context.promptReview}`);

      // Attempt to parse the JSON string
      const parsedReview = JSON.parse(context.promptReview);

      // Function to find the keys in a nested JSON
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

      // Extract success and feedback from the nested JSON
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
      // Log the error and the received JSON string for better debugging
      this.logger.error('Failed to parse prompt review JSON', error);
      this.logger.error(`Invalid JSON: ${context.promptReview}`);
      return {};
    }
  }
}

// import { Injectable, Logger } from '@nestjs/common';
// import { ValidatePromptContext } from '../../../agents/types/validate-prompt/validate-prompt.interface';

// @Injectable()
// export class ParsePromptService {
//   private readonly logger = new Logger(ParsePromptService.name);

//   parsePromptReview(context: ValidatePromptContext): {
//     success?: boolean;
//     feedback?: string;
//   } {
//     try {
//       const parsedReview = JSON.parse(context.promptReview);

//       const success = parsedReview.success;
//       const feedback = parsedReview.feedback;

//       if (success !== undefined) {
//         return { success, feedback };
//       } else {
//         this.logger.error('Failed to parse success status from prompt review');
//         return { feedback };
//       }
//     } catch (error) {
//       this.logger.error('Failed to parse prompt review JSON', error);
//       this.logger.error(`Invalid JSON: ${context.promptReview}`);
//       return {};
//     }
//   }
// }
