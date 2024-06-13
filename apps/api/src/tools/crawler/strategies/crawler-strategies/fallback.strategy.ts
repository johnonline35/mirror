// import { Browser } from 'puppeteer';
// import { PuppeteerUtilityService } from '../../../../common/utils/puppeteer/puppeteer.service';
// import { CheerioUtilityService } from '../../../../common/utils/cheerio/cheerio.service';

// import { ICrawlerStrategy } from '../crawler-strategy.interface';
// import {
//   retryOperation,
//   RetryOptions,
// } from '../../../../common/utils/retry.utility';
// import { Injectable, Logger } from '@nestjs/common';
// import { ITask } from '../../../../interfaces/task.interface';

// @Injectable()
// export class FallbackStrategy implements ICrawlerStrategy {
//   private readonly logger = new Logger(FallbackStrategy.name);
//   private urlQueue: [string, number][] = [];
//   private visitedUrls = new Set<string>();
//   private externalLinks = new Map<string, string>();
//   private urlDepthMap = new Map<string, number>();

//   constructor(
//     private puppeteerService: PuppeteerUtilityService,
//     private cheerioService: CheerioUtilityService,
//   ) {}

//   async execute(task: ITask): Promise<any> {
//     const { url } = task.details;
//     this.logger.log(`Executing strategy for URL: ${url}`);

//     const isAccessible = await page
//       .goto(url, {
//         waitUntil: 'domcontentloaded',
//         timeout: 60000,
//       }) // Increased timeout
//       .then(
//         () => true,
//         (error) => {
//           this.logger.error(`Failed to access URL: ${url}`, error);
//           return false;
//         },
//       );
//     if (!isAccessible) {
//       return []; // Returning empty result or handling error appropriately
//     }

//     this.enqueueUrl(url, currentDepth);
//     return await this.crawlUrl(crawlRequestDto);
//   }

//   async crawlUrl(crawlRequestDto: CrawlRequestDto): Promise<any[]> {
//     this.logger.log(`Starting to crawl URL: ${url}`);

//     if (!this.puppeteerService) {
//       throw new Error('PuppeteerService is not initialized');
//     }

//     const browser = await this.puppeteerService.launchBrowser();
//     const crawlResults = [];

//     try {
//       while (this.urlQueue.length > 0) {
//         const [url, depth] = this.urlQueue.shift();
//         this.logger.log(`URL Queue Length: ${this.urlQueue.length}`);
//         if (!this.visitedUrls.has(url) && depth <= crawlRequestDto.maxDepth) {
//           this.visitedUrls.add(url);
//           const retryOptions: RetryOptions = {
//             retries: 3,
//             minTimeout: 1000,
//             maxTimeout: 30000,
//             factor: 2,
//             onRetry: (error, attemptNumber) => {
//               this.logger.log(
//                 `Attempt ${attemptNumber} failed with error: ${error}. There are ${3 - attemptNumber} retries left.`,
//               );
//             },
//           };
//           try {
//             const result = await retryOperation(
//               () =>
//                 this.crawlPage(url, browser, depth, crawlRequestDto.maxDepth),
//               retryOptions,
//             );
//             crawlResults.push(result);
//             this.logger.log(`Crawling completed for URL: ${url}`);
//           } catch (error) {
//             this.logger.log(
//               `Crawling failed for URL: ${url} with error: ${error}`,
//             );
//             // TODO handle specific failures per URL
//           }
//         }
//       }
//     } catch (error) {
//       this.logger.log(`Crawl failed`, error);
//       throw error;
//     } finally {
//       await browser.close();
//     }
//     return crawlResults;
//   }

//   private async crawlPage(
//     url: string,
//     browser: Browser,
//     currentDepth: number,
//     maxDepth: number,
//   ): Promise<any> {
//     const page = await this.puppeteerService.createPage(browser);
//     try {
//       await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 }); // Increased timeout
//       const htmlContent = await page.content();
//       const processedContent = this.processContent(htmlContent);
//       this.processLinks(htmlContent, url, currentDepth, maxDepth);
//       await page.close();
//       return processedContent;
//     } catch (error) {
//       this.logger.error(`Failed to crawl page at URL: ${url}`, error);
//       await page.close();
//       throw error;
//     }
//   }

//   private isInternal(link: string, baseUrl: string): boolean {
//     return new URL(link, baseUrl).hostname === new URL(baseUrl).hostname;
//   }

//   private processContent(htmlContent: string): string {
//     const $ = this.cheerioService.load(htmlContent);
//     $(
//       'script, link[rel="stylesheet"], style, svg, path, meta, noscript, iframe, object, embed',
//     ).remove();

//     // Remove style attributes
//     $('[style]').removeAttr('style');

//     // Remove empty elements
//     $('*')
//       .filter((_, el) => !$(el).html().trim())
//       .remove();

//     // Extract text content
//     let cleanedText = $('body').text().trim();

//     // Clean up the white space
//     cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

//     this.logger.log(`The text from the page: "${cleanedText}"`);

//     return cleanedText;
//   }

//   private processLinks(
//     htmlContent: string,
//     url: string,
//     currentDepth: number,
//     maxDepth: number,
//   ): void {
//     const $ = this.cheerioService.load(htmlContent);
//     const links = $('a')
//       .map((_, link) => {
//         const href = $(link).attr('href');
//         const text = $(link).text().trim();
//         return { href, text };
//       })
//       .get();

//     this.logger.log('Links:', links);

//     links.forEach((link) => {
//       if (link.href) {
//         const absoluteUrl = new URL(link.href, url).toString();
//         if (this.isInternal(absoluteUrl, url) && currentDepth < maxDepth) {
//           this.enqueueUrl(absoluteUrl, currentDepth + 1); // Enqueue deeper internal links
//         } else {
//           this.externalLinks.set(absoluteUrl, link.text); // Collect external links with text
//         }
//       }
//     });
//   }

//   private enqueueUrl(url: string, depth: number): void {
//     if (!this.visitedUrls.has(url)) {
//       this.urlQueue.push([url, depth]);
//       this.urlDepthMap.set(url, depth);
//       this.logger.log(`Enqueued new URL: ${url} at depth ${depth}`);
//       this.logger.log(`Current URL Queue Length: ${this.urlQueue.length}`);
//     }
//   }
// }
