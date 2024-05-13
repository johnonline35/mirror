// import { PrismaService } from '../../../../prisma/prisma.service';
// import { CrawlerStrategy } from '../crawler-strategy.type';
// import {
//   PuppeteerService,
//   Browser,
// } from '../../../utilities/puppeteer/puppeteer.service';
// export class FallbackStrategy implements CrawlerStrategy {
//   private urlQueue: [string, number][] = [];
//   private visitedUrls = new Set<string>();
//   private externalLinks = new Set<string>();
//   private urlDepthMap = new Map<string, number>();

//   constructor(
//     private prisma: PrismaService,
//     private puppeteerService: PuppeteerService,
//   ) {}

//   async executeStrategy(
//     url: string,
//     browser: Browser,
//     maxDepth: number,
//     currentDepth: number = 0,
//   ): Promise<any> {
//     // Implementation of the specific crawling logic for this strategy
//   }
//   async crawlUrl(
//     crawlRequestDto: crawlRequestDto,
//     maxDepth: number,
//   ): Promise<any> {
//     console.log(`Starting to crawl URL: ${crawlRequestDto.url}`);
//     this.enqueueUrl(crawlRequestDto.url, 0); // Enqueue initial URL with depth 0
//     const job = await this.createJob(crawlRequestDto.url);
//     const browser = await this.puppeteerService.launchBrowser();

//     try {
//       while (this.urlQueue.length > 0) {
//         const [url, depth] = this.urlQueue.shift(); // Dequeue the next URL and its depth
//         if (!this.visitedUrls.has(url) && depth <= maxDepth) {
//           this.visitedUrls.add(url);
//           const result = await retry(
//             async () => {
//               return this.crawlPage(url, browser, depth, maxDepth);
//             },
//             {
//               retries: 3,
//               minTimeout: 1000,
//               maxTimeout: 30000,
//               factor: 2,
//               onRetry: (error, attemptNumber) => {
//                 console.log(
//                   `Attempt ${attemptNumber} failed. There are ${3 - attemptNumber} retries left.`,
//                 );
//               },
//             },
//           );

//           console.log(`Crawling completed for URL: ${url}`);
//           await this.updateJobStatus(job.jobId, 'done', result);
//           console.log(`Job ${job.jobId} updated to 'done' with result.`);
//         }
//       }
//       return { externalLinks: Array.from(this.externalLinks) };
//     } catch (error) {
//       console.error(`Crawl failed`, error);
//       await this.updateJobStatus(job.jobId, 'failed');
//       throw error;
//     } finally {
//       await browser.close();
//     }
//   }

//   private async crawlPage(
//     url: string,
//     browser: Browser,
//     currentDepth: number,
//     maxDepth: number,
//   ): Promise<any> {
//     const page = await browser.newPage();
//     await page.authenticate({
//       username: process.env.SMARTPROXY_USERNAME,
//       password: process.env.SMARTPROXY_PASSWORD,
//     });
//     try {
//       await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
//       const content = await page.content();
//       const processedContent = this.processContent(content);
//       // console.log(`Content from URL: ${url}`);
//       // console.log(processedContent);

//       // Extract all links and classify them
//       const links = await page.$$eval('a', (anchors) =>
//         anchors.map((a) => a.href),
//       );
//       links.forEach((link) => {
//         if (this.isInternal(link, url) && currentDepth < maxDepth) {
//           this.enqueueUrl(link, currentDepth + 1);
//         } else {
//           this.externalLinks.add(link);
//         }
//       });

//       return processedContent;
//     } finally {
//       await page.close();
//     }
//   }

//   private isInternal(link: string, baseUrl: string): boolean {
//     return new URL(link).hostname === new URL(baseUrl).hostname;
//   }

//   private async createJob(url: string) {
//     console.log(`Creating job for URL: ${url}`);
//     const job = await this.prisma.job.create({
//       data: { url, status: 'started' },
//     });
//     console.log(`Job created with ID: ${job.jobId}`);
//     return job;
//   }

//   private async updateJobStatus(jobId: string, status: string, data?: any) {
//     console.log(`Updating job ${jobId} to status '${status}'.`);
//     const updateData = { status, data };
//     const updatedJob = await this.prisma.job.update({
//       where: { jobId },
//       data: updateData,
//     });
//     console.log(`Job ${jobId} status updated to '${status}'.`);
//     return updatedJob;
//   }

//   private processContent(content: string): any {
//     const dataCleaningOptions = new CreateDataPreprocessorDto();
//     dataCleaningOptions.removeScripts = true;
//     dataCleaningOptions.removeStyles = true;
//     dataCleaningOptions.removeLinks = true;

//     content = this.dataPreprocessor.cleanHtml(content, dataCleaningOptions); // Clean the HTML here
//     // console.log(`Cleaned content from URL: ${url}`);
//     console.log('cleaned content:', content);
//   }

//   private enqueueUrl(url: string, depth: number): void {
//     if (!this.visitedUrls.has(url)) {
//       this.urlQueue.push([url, depth]);
//       this.urlDepthMap.set(url, depth);
//       console.log(`Enqueued new URL: ${url} at depth ${depth}`);
//     }
//   }
// }
