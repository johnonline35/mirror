import { Injectable } from '@nestjs/common';
import { CrawlerStrategy } from './crawler-strategy.type';
// import { FallbackStrategy } from './strategies/fallback.strategy';
import { PrismaService } from '../../../prisma/prisma.service';
import { PuppeteerService } from '../../utilities/puppeteer/puppeteer.service';
// import { LlmService } from '../llm/llm.service'; // A hypothetical service to interact with the LLM

@Injectable()
export class CrawlerFactoryService {
  constructor(
    private prismaService: PrismaService,
    private puppeteerService: PuppeteerService,
  ) {}
  // TODO Implement LLM
  //   constructor(private llmService: LlmService) {}

  prompt = `
Review the following summary from a homepage URL. Then select from these strings and return only the string wrapped in quotes like this: 'string goes here wrapped in quotes' with no other information.

"Based on the description of the website provided, return 'ecommerce' if the website is classified as an ecommerce platform."

"Based on the description of the website provided, return 'saas' if the website is classified as a Software as a Service (SaaS) platform."

"Based on the description of the website provided, return 'content' if the website is classified as a news, blog or other type of content platform."

"Based on the description of the website provided, return 'fallback' if the website does not fit into any of the other categories."

Here is the content from the homepage as a summary:
`;

  async getStrategy(homePageSummary: string): Promise<CrawlerStrategy> {
    console.log('Strategy will be based on analysis of:', homePageSummary);

    // const strategyName = await this.llmService.predictStrategy(homePageSummary);
    // switch (strategyName) {
    //   case 'SpecificStrategy': // Example specific strategy
    //     return new SpecificStrategy();
    //   default:
    //     return new FallbackStrategy();
    // }
    // return new FallbackStrategy(this.prismaService, this.puppeteerService);
    return null;
  }
}
