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

      let promptReview = context.promptReview;

      // Generalized cleaning method to remove any non-JSON formatting
      promptReview = this.cleanMarkdown(promptReview);

      // Extract the first valid JSON object
      promptReview = this.extractJsonFromText(promptReview);

      const parsedReview = JSON.parse(promptReview);

      const { success, feedback } = this.findKeys(parsedReview, [
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

  // Clean up markdown formatting and unnecessary text
  cleanMarkdown(text: string): string {
    return text
      .replace(/```json\n?/g, '') // Remove ```json
      .replace(/```/g, '') // Remove closing ```
      .replace(/Corrected Schema:\n/g, '') // Remove specific labels
      .replace(/[^{}[\],:\"\d\w\s\.\-]/g, ''); // Remove all non-JSON-friendly characters
  }

  // Extract first valid JSON object from a string
  extractJsonFromText(text: string): string {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No valid JSON object found in text');
    }
    return text.substring(jsonStart, jsonEnd + 1);
  }

  // Utility to find specific keys in a nested object
  findKeys(obj: any, keys: string[]): any {
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
  }
}

// @Injectable()
// export class ParsePromptService {
//   private readonly logger = new Logger(ParsePromptService.name);

//   parsePromptReview(context: ValidatePromptContext): {
//     success?: boolean;
//     feedback?: string;
//   } {
//     try {
//       this.logger.log(
//         'Received prompt review JSON:',
//         JSON.stringify(context.promptReview),
//       );

//       const parsedReview = JSON.parse(context.promptReview);

//       const findKeys = (obj: any, keys: string[]) => {
//         const result: any = {};
//         const helper = (obj: any) => {
//           if (obj && typeof obj === 'object') {
//             for (const key in obj) {
//               if (keys.includes(key)) {
//                 result[key] = obj[key];
//               }
//               if (typeof obj[key] === 'object') {
//                 helper(obj[key]);
//               }
//             }
//           }
//         };
//         helper(obj);
//         return result;
//       };

//       const { success, feedback } = findKeys(parsedReview, [
//         'success',
//         'feedback',
//       ]);

//       if (success !== undefined) {
//         return { success, feedback };
//       } else {
//         this.logger.error('Failed to parse success status from prompt review');
//         return { feedback };
//       }
//     } catch (error) {
//       this.logger.error('Failed to parse prompt review JSON', error);
//       this.logger.error(
//         `Invalid JSON: ${JSON.stringify(context.promptReview)}`,
//       );
//       return {};
//     }
//   }
// }
