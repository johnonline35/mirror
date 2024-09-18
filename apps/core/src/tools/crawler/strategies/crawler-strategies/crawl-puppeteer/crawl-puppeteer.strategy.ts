import { Injectable, Logger } from '@nestjs/common';
import { ITask } from '../../../../../interfaces/task.interface';
import { ICrawlerStrategy } from '../crawler-strategy.interface';
import { LambdaService } from '../../../../../lambda/lambda.service';

@Injectable()
export class CrawlPuppeteerStrategy implements ICrawlerStrategy {
  private readonly logger = new Logger(CrawlPuppeteerStrategy.name);

  private readonly lambdaEndpoint = process.env.PUPPETEER_LAMBDA_ENDPOINT;

  constructor(private lambdaService: LambdaService) {}

  async execute(task: ITask, url?: string): Promise<string> {
    this.logger.log('Executing task:', JSON.stringify(task));

    const targetUrl = url || task.details.url;
    const html = this.crawlUrl(targetUrl);
    return html;
  }

  private async crawlUrl(url: string): Promise<string> {
    this.logger.log(`Starting to crawl URL: ${url}`);
    try {
      const html = await this.crawlUrlWithLambda(url);
      return html;
    } catch (error) {
      this.logger.error(`Crawl failed: ${error.stack}`);
      throw error;
    }
  }

  private async crawlUrlWithLambda(url: string): Promise<string> {
    try {
      const lambdaFunctionName = this.lambdaEndpoint;
      if (!lambdaFunctionName) {
        throw new Error(
          'PUPPETEER_LAMBDA_ENDPOINT environment variable not set',
        );
      }

      const result = await this.lambdaService.invokeLambda(lambdaFunctionName, {
        url,
      });
      const resultSnippet = result.html.substring(0, 200);
      this.logger.log('resultSnippet:', resultSnippet);

      return result.html;
    } catch (error) {
      this.logger.error(
        `Failed to fetch HTML from Lambda for URL: ${url}. Error: ${error.message}`,
      );
      throw error;
    }
  }
}

// import { Injectable, Logger } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { lastValueFrom, timeout } from 'rxjs';
// import { ITask } from '../../../../../interfaces/task.interface';
// import { ICrawlerStrategy } from '../crawler-strategy.interface';

// @Injectable()
// export class CrawlPuppeteerStrategy implements ICrawlerStrategy {
//   private readonly logger = new Logger(CrawlPuppeteerStrategy.name);

//   constructor(private httpService: HttpService) {}

//   async execute(task: ITask, url?: string): Promise<string> {
//     this.logger.log('Executing task:', task);
//     const targetUrl = url || task.details.url;
//     return this.crawlUrl(targetUrl);
//   }

//   private async crawlUrl(url: string): Promise<string> {
//     this.logger.log(`Starting to crawl URL: ${url}`);
//     try {
//       const html = await this.fetchHtmlFromLambda(url);
//       return html;
//     } catch (error) {
//       this.logger.error(`Crawl failed: ${error.stack}`);
//       throw error;
//     }
//   }

//   private async fetchHtmlFromLambda(url: string): Promise<string> {
//     try {
//       const response = await lastValueFrom(
//         this.httpService
//           .post(
//             'https://mpxklzro41.execute-api.us-east-1.amazonaws.com/default/node_only_puppeteer',
//             { url: url },
//           )
//           .pipe(
//             timeout(5000), // Timeout after 5 seconds
//           ),
//       );

//       if (response.status !== 200) {
//         throw new Error(`Lambda function returned status ${response.status}`);
//       }

//       if (!response.data || !response.data.html) {
//         throw new Error('Response format is invalid or missing HTML content');
//       }

//       const { html } = response.data;
//       return html;
//     } catch (error) {
//       this.logger.error(
//         `Failed to fetch HTML from Lambda for URL: ${url}. Error: ${error.message}`,
//       );
//       throw error;
//     }
//   }
// }

// import { Injectable, Logger, Inject } from '@nestjs/common';
// import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
// import {
//   PuppeteerUtilityService,
//   Page,
// } from '../../../../../common/utils/puppeteer/puppeteer.service';
// import {
//   retryOperation,
//   RetryOptions,
// } from '../../../../../common/utils/retry.utility';
// import { ITask } from '../../../../../interfaces/task.interface';
// import { ICrawlerStrategy } from '../crawler-strategy.interface';
// import { ExtractedPageData } from '../crawler-strategy.interface';
// import { CheerioUtilityService } from '../../../../../common/utils/cheerio/cheerio.service';

// @Injectable()
// export class CrawlPuppeteerStrategy implements ICrawlerStrategy {
//   private readonly logger = new Logger(CrawlPuppeteerStrategy.name);

//   constructor(
//     private puppeterUtilityService: PuppeteerUtilityService,
//     private cheerioUtilityService: CheerioUtilityService,
//     @Inject(CACHE_MANAGER) private cacheManager: Cache,
//   ) {}

//   async execute(task: ITask, url?: string): Promise<ExtractedPageData> {
//     this.logger.log('executing task:', task);
//     if (url) {
//       const extractedPageData = await this.crawlUrl(url);
//       return extractedPageData;
//     } else {
//       const url = task.details.url;
//       const extractedPageData = await this.crawlUrl(url);
//       return extractedPageData;
//     }
//   }

//   private async crawlUrl(url: string): Promise<ExtractedPageData> {
//     this.logger.log(`Starting to crawl URL: ${url}`);
//     const browser = await this.puppeterUtilityService.launchBrowser();

//     try {
//       const page = await this.puppeterUtilityService.createPage(browser);
//       const extractedPageData = await this.crawlWithRetry(url, page);
//       return extractedPageData;
//     } catch (error) {
//       this.logger.error(`Crawl failed`, error.stack);
//       throw error;
//     } finally {
//       await browser.close();
//     }
//   }

//   private async crawlWithRetry(
//     url: string,
//     page: Page,
//   ): Promise<ExtractedPageData> {
//     const retryOptions: RetryOptions = {
//       retries: 10,
//       factor: 2,
//       minTimeout: 1000,
//       maxTimeout: 60000,
//       logLevel: 'verbose',
//       customErrorHandler: (error) => {
//         this.logger.error('Encountered an error:', error);
//       },
//     };

//     return retryOperation(() => this.extractPageData(url, page), retryOptions);
//   }

//   private async scrollToBottom(page: Page) {
//     const getRandomInt = (min: number, max: number) =>
//       Math.floor(Math.random() * (max - min + 1)) + min;
//     const timeout = (milliseconds: number): Promise<void> => {
//       return new Promise((resolve) => setTimeout(resolve, milliseconds));
//     };

//     const scrollDown = async () => {
//       const distance = getRandomInt(107, 311); // Random distance between 100 and 300 pixels
//       await page.evaluate(async (distance) => {
//         window.scrollBy(0, distance);
//       }, distance);
//       const delay = getRandomInt(306, 1287); // Random delay
//       await timeout(delay);
//     };

//     let previousHeight = await page.evaluate('document.body.scrollHeight');
//     let scrollAttempts = 0;

//     while (scrollAttempts < 10) {
//       // Increase the number of attempts if necessary
//       await scrollDown();
//       const newHeight = await page.evaluate('document.body.scrollHeight');
//       if (newHeight === previousHeight) {
//         scrollAttempts++;
//         if (scrollAttempts >= 3) {
//           // Allow a few retries to handle lazy-loaded content
//           break;
//         }
//       } else {
//         previousHeight = newHeight;
//         scrollAttempts = 0; // Reset attempts if new content is loaded
//       }
//     }
//   }

//   private async extractPageData(
//     url: string,
//     page: Page,
//   ): Promise<ExtractedPageData> {
//     this.logger.log(`Navigating to URL: ${url} at ${new Date().toISOString()}`);

//     try {
//       const navigationStart = Date.now();
//       await page.goto(url, {
//         waitUntil: 'networkidle0',
//         timeout: 60000,
//       });
//       const navigationEnd = Date.now();
//       this.logger.log(
//         `Navigation to ${url} took ${navigationEnd - navigationStart}ms`,
//       );

//       this.logger.log('Started scrolling');
//       const scrollStart = Date.now();

//       // Scroll to the bottom or handle infinite scrolling
//       await this.scrollToBottom(page);

//       const scrollEnd = Date.now();
//       this.logger.log(`Scrolling took ${scrollEnd - scrollStart}ms`);

//       const extractionStart = Date.now();
//       const extractedPageData =
//         await this.cheerioUtilityService.extractPageData(page, url);
//       const extractionEnd = Date.now();
//       this.logger.log(
//         `Data extraction took ${extractionEnd - extractionStart}ms`,
//       );

//       return extractedPageData;
//     } catch (error) {
//       this.logger.error(
//         `Failed to extract page data from ${url}: ${error.message}`,
//         error.stack,
//       );
//       throw error; // Re-throw the error after logging it
//     }
//   }
// }
