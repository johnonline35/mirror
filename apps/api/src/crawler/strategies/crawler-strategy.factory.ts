import { Injectable, Logger } from '@nestjs/common';
import { CrawlerStrategy } from './crawler-strategy.interface';
import { OpenAiService } from '../../llm/llms/openai/openai.service';
import { FallbackStrategy } from './crawler-strategies/fallback.strategy';
import { TemplatesService } from '../../llm/templates/templates.service';
import { AdaptersService } from '../../llm/adapters/adapters.service';
import { LLMOptions } from '../../llm/llm.interface';

@Injectable()
export class CrawlerStrategyFactory {
  private readonly logger = new Logger(CrawlerStrategyFactory.name);

  constructor(
    private fallbackStrategy: FallbackStrategy,
    private openAiService: OpenAiService,
    private templatesService: TemplatesService,
    private adaptersService: AdaptersService,
  ) {}

  async getStrategy(extractedHomePage: string): Promise<CrawlerStrategy> {
    this.logger.log(`Received extracted homepage: ${extractedHomePage}`);

    try {
      const summarizationTemplate =
        this.templatesService.getSummarizationTemplate('3.0');
      const summarizationPrompt = summarizationTemplate.render({
        text: extractedHomePage,
      });
      this.logger.log('&&&&summarizationPrompt:', summarizationPrompt);

      const summarizationOptions: LLMOptions = {
        model: 'gpt-3.5-turbo-0125',
        maxTokens: 500,
        temperature: 0.3,
      };

      const summarizedText = await this.openAiService.adapt(
        summarizationPrompt,
        summarizationOptions,
      );
      this.logger.log(
        `Summarized text (raw): ${JSON.stringify(summarizedText)}`,
      );

      const classificationTemplate =
        this.templatesService.getClassificationTemplate('1.0');
      const classificationPrompt = classificationTemplate.render({
        summary: summarizedText,
      });

      this.logger.log(
        `classificationPrompt: ${JSON.stringify(classificationPrompt)}`,
      );

      const classificationOptions: LLMOptions = {
        model: 'gpt-4o-2024-05-13',
        maxTokens: 50,
        temperature: 0,
      };

      const strategyName = await this.openAiService.adapt(
        classificationPrompt,
        classificationOptions,
      );
      this.logger.log('Open AI response verbatim:', strategyName);

      const normalizedResponse = strategyName
        .replace(/^['"]|['"]$/g, '')
        .trim();
      this.logger.log('Normalized response:', normalizedResponse);

      switch (normalizedResponse) {
        // Add cases for different strategies
        default:
          this.logger.log('Using FallbackStrategy');
          return this.fallbackStrategy;
      }
    } catch (error) {
      this.logger.error(
        `Error determining strategy for summary: ${extractedHomePage}`,
        error.stack,
      );
      throw error;
    }
  }
}

// import { Injectable, Logger } from '@nestjs/common';
// import { CrawlerStrategy } from './crawler-strategy.interface';
// import { OpenAiService } from '../../llm/llms/openai/openai.service';
// import { FallbackStrategy } from './crawler-strategies/fallback.strategy';
// import { LLMOptions } from '../../llm/llm.interface';

// @Injectable()
// export class CrawlerStrategyFactory {
//   private readonly logger = new Logger(CrawlerStrategyFactory.name);

//   constructor(
//     private fallbackStrategy: FallbackStrategy,
//     private openAiService: OpenAiService,
//   ) {}

//   async getStrategy(extractedHomePage: string): Promise<CrawlerStrategy> {
//     this.logger.log(`Received extracted homepage: ${extractedHomePage}`);

//     try {
//       const summarizedText =
//         await this.openAiService.summarizeHomepageText(extractedHomePage);
//       this.logger.log(`GPT 3.5 Summarized text: ${summarizedText}`);

//       const messages = [
//         {
//           role: 'system',
//           content:
//             'You are a helpful assistant designed to output a single word.',
//         },
//         {
//           role: 'user',
//           content: `Review the following summary from a homepage URL. Then select from these words and return only the word wrapped in quotes like this: 'word' with no other information or commentary.

// "Based on the description of the website provided, return the single word 'ecommerce' if the website is classified as an ecommerce platform."

// "Based on the description of the website provided, return the single word 'saas' if the website is classified as a Software as a Service (SaaS) platform."

// "Based on the description of the website provided, return the single word 'content' if the website is classified as a news, blog or other type of content platform."

// "Based on the description of the website provided, return the single word 'fallback' if the website does not fit into any of the other categories."

// Here is the content from the homepage as a summary:
// <Content>
// ${summarizedText}
// </Content> `,
//         },
//       ];

//       const strategyName = await this.openAiService.createCompletion(messages, {
//         model: 'gpt-4o-2024-05-13',
//         maxTokens: 50,
//         temperature: 0,
//       } as LLMOptions);
//       this.logger.log('Open AI response verbatim:', strategyName);

//       const normalizedResponse = strategyName
//         .replace(/^['"]|['"]$/g, '')
//         .trim();
//       this.logger.log('Normalized response:', normalizedResponse);

//       switch (normalizedResponse) {
//         // case 'ecommerce':
//         //   this.logger.log('OpenAI has chosen EcommerceStrategy()');
//         //   // return new EcommerceStrategy(); // Example specific strategy
//         //   break;
//         // case 'saas':
//         //   this.logger.log('OpenAI has chosen SaasStrategy()');
//         //   // return new SaasStrategy();
//         //   break;
//         // case 'other': return this.otherStrategy;
//         //   break;
//         default:
//           this.logger.log('OpenAI has chosen FallbackStrategy()');
//           return this.fallbackStrategy;
//       }
//     } catch (error) {
//       this.logger.error(
//         `Error determining strategy for summary: ${extractedHomePage}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }
// }
