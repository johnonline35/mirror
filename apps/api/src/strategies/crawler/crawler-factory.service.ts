import { Injectable } from '@nestjs/common';
import { CrawlerStrategy } from './crawler-strategy.type';
import { OpenAiService } from '../../llm/openai/openai.service';

@Injectable()
export class CrawlerFactoryService {
  constructor(private openaiService: OpenAiService) {}

  async getStrategy(homePageSummary: string): Promise<CrawlerStrategy> {
    const messages = [
      {
        role: 'system',
        content:
          'You are a helpful assistant designed to output a single word.',
      },
      {
        role: 'user',
        content: `Review the following summary from a homepage URL. Then select from these words and return only the word wrapped in quotes like this: 'word' with no other information or commentary.

"Based on the description of the website provided, return the single word 'ecommerce' if the website is classified as an ecommerce platform."

"Based on the description of the website provided, return return the single word 'saas' if the website is classified as a Software as a Service (SaaS) platform."

"Based on the description of the website provided, return return the single word 'content' if the website is classified as a news, blog or other type of content platform."

"Based on the description of the website provided, return return the single word 'fallback' if the website does not fit into any of the other categories."

Here is the content from the homepage as a summary: 
<Content>
${homePageSummary}
</Content> `,
      },
    ];

    console.log('Strategy will be based on analysis of:', homePageSummary);
    const strategyName =
      await this.openaiService.getResponseFromMessages_50TokenLimit(messages);
    console.log('Open AI repsonse verbatim:', strategyName);

    const normalizedResponse = strategyName.replace(/^['"]|['"]$/g, '').trim();
    switch (normalizedResponse) {
      case 'ecommerce':
        console.log('OpenAI has chosen EcommerceStrategy()');
        // return new EcommerceStrategy(); // Example specific strategy
        break;
      case 'saas':
        console.log('OpenAI has chosen SaasStrategy()');
        // return new SaasStrategy();
        break;
      case 'content':
        console.log('OpenAI has chosen ContentStrategy()');
        // return new ContentStrategy();
        break;
      default:
        console.log('OpenAI has chosen FallbackStrategy');
        // return new FallbackStrategy(this.prismaService, this.puppeteerService);
        break;
    }

    return null;
  }
}
