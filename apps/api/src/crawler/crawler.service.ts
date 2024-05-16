import { Injectable } from '@nestjs/common';
import { CrawlRequestDto } from './dto/CrawlRequestDto.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as cheerio from 'cheerio';
import { CrawlerFactoryService } from '../strategies/crawler/crawler-factory.service';
import {
  PuppeteerService,
  Browser,
  Page,
} from '../utilities/puppeteer/puppeteer.service';
import { retryOperation, RetryOptions } from '../utilities/retry.utility';

@Injectable()
export class CrawlerService {
  constructor(
    private prisma: PrismaService,
    private crawlerFactory: CrawlerFactoryService,
    private puppeteerService: PuppeteerService,
  ) {}

  async crawlUrl(crawlRequestDto: CrawlRequestDto): Promise<any> {
    console.log(`Starting to crawl URL: ${crawlRequestDto.url}`);
    const job = await this.createJob(crawlRequestDto.url);
    const browser = await this.puppeteerService.launchBrowser();

    try {
      const page = await this.puppeteerService.createPage(browser);
      const result = await this.crawlWithRetry(crawlRequestDto, page, browser);
      await this.updateJobStatus(job.jobId, 'done', result);
      return result;
    } catch (error) {
      console.error(`Crawl failed`, error);
      await this.updateJobStatus(job.jobId, 'failed');
      throw error;
    } finally {
      await browser.close();
    }
  }

  private async crawlWithRetry(
    crawlRequestDto: CrawlRequestDto,
    page: Page,
    browser: Browser,
  ): Promise<any> {
    const retryOptions: RetryOptions = {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 30000,
      logLevel: 'verbose',
      customErrorHandler: (error) => {
        console.error('Encountered an error:', error);
      },
    };

    return retryOperation(
      () => this.performCrawl(crawlRequestDto, page, browser),
      retryOptions,
    );
  }

  private async performCrawl(
    crawlRequestDto: CrawlRequestDto,
    page: Page,
    browser: Browser,
  ): Promise<any> {
    await page.goto(crawlRequestDto.url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await this.puppeteerService.performTwoScrolls(page);

    const homePageSummary = await this.extractHomePageData(page);
    console.log(`Home Page Summary: ${homePageSummary}`);

    const strategy = await this.crawlerFactory.getStrategy(homePageSummary);
    console.log('finished', strategy);
    return null;
    // return strategy.executeStrategy(
    //   crawlRequestDto.url,
    //   browser,
    //   crawlRequestDto.maxDepth,
    // );
  }

  private async extractHomePageData(page: Page): Promise<string> {
    const html = await page.content();
    const $ = cheerio.load(html);

    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content');
    const keywords = $('meta[name="keywords"]').attr('content');

    const h1Headers = $('h1')
      .map((i, el) => $(el).text().trim())
      .get()
      .join(', ');
    const h2Headers = $('h2')
      .map((i, el) => $(el).text().trim())
      .get()
      .join(', ');

    const navLinks = $('nav a')
      .map((i, el) => ({
        text: $(el).text().trim(),
        href: $(el).attr('href'),
      }))
      .get();

    const footerText = $('footer').text().trim();

    const structuredData = $('script[type="application/ld+json"]')
      .map((i, el) => {
        try {
          return JSON.parse($(el).html());
        } catch (e) {
          return null;
        }
      })
      .get()
      .filter((data) => data !== null);

    const fiveParagraphs = $('p')
      .slice(0, 5)
      .map((i, el) => $(el).text().trim())
      .get()
      .join(' ');

    const listItems = $('ul li')
      .map((i, el) => $(el).text().trim())
      .get()
      .join(', ');

    const summary =
      `The homepage titled "${title}", ` +
      `includes keywords such as ${keywords || 'none specified'}. ` +
      `Description: ${metaDescription}. ` +
      `Main headers include: ${h1Headers}. ` +
      `Subheaders include: ${h2Headers}. ` +
      `Navigation links found: ${navLinks.map((link) => link.text + ' (' + link.href + ')').join(', ')}. ` +
      `Footer says: "${footerText}". ` +
      `The page contains the following structured data: ${JSON.stringify(structuredData)}. ` +
      `Detailed content: ${fiveParagraphs}. ` +
      `List items include: ${listItems}. `;

    return summary;
  }

  private async createJob(url: string) {
    console.log(`Creating job for URL: ${url}`);
    return await this.prisma.job.create({
      data: { url, status: 'started' },
    });
  }

  private async updateJobStatus(jobId: string, status: string, data?: any) {
    console.log(`Updating job status for ${jobId} to ${status}`);
    const dataToUpdate = {
      status,
      data: JSON.stringify(data),
    };
    try {
      return await this.prisma.job.update({
        where: { jobId },
        data: dataToUpdate,
      });
    } catch (error) {
      console.error(`Failed to update job status for ${jobId}`, error);
      throw error;
    }
  }

  // async crawlUrl(
  //   crawlRequestDto: crawlRequestDto,
  //   maxDepth: number,
  // ): Promise<any> {
  //   console.log(`Starting to crawl URL: ${crawlRequestDto.url}`);
  //   this.enqueueUrl(crawlRequestDto.url, 0); // Enqueue initial URL with depth 0
  //   const job = await this.createJob(crawlRequestDto.url);
  //   const browser = await puppeteer.launch({
  //     args: [
  //       '--no-sandbox',
  //       '--disable-setuid-sandbox',
  //       `--proxy-server=https://${process.env.SMARTPROXY_SERVER}`,
  //     ],
  //   });

  //   try {
  //     while (this.urlQueue.length > 0) {
  //       const [url, depth] = this.urlQueue.shift(); // Dequeue the next URL and its depth
  //       if (!this.visitedUrls.has(url) && depth <= maxDepth) {
  //         this.visitedUrls.add(url);
  //         const result = await retry(
  //           async () => {
  //             return this.crawlPage(url, browser, depth, maxDepth);
  //           },
  //           {
  //             retries: 3,
  //             minTimeout: 1000,
  //             maxTimeout: 30000,
  //             factor: 2,
  //             onRetry: (error, attemptNumber) => {
  //               console.log(
  //                 `Attempt ${attemptNumber} failed. There are ${3 - attemptNumber} retries left.`,
  //               );
  //             },
  //           },
  //         );

  //         console.log(`Crawling completed for URL: ${url}`);
  //         await this.updateJobStatus(job.jobId, 'done', result);
  //         console.log(`Job ${job.jobId} updated to 'done' with result.`);
  //       }
  //     }
  //     return { externalLinks: Array.from(this.externalLinks) };
  //   } catch (error) {
  //     console.error(`Crawl failed`, error);
  //     await this.updateJobStatus(job.jobId, 'failed');
  //     throw error;
  //   } finally {
  //     await browser.close();
  //   }
  // }

  // private async crawlPage(
  //   url: string,
  //   browser: Browser,
  //   currentDepth: number,
  //   maxDepth: number,
  // ): Promise<any> {
  //   const page = await browser.newPage();
  //   await page.authenticate({
  //     username: process.env.SMARTPROXY_USERNAME,
  //     password: process.env.SMARTPROXY_PASSWORD,
  //   });
  //   try {
  //     await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  //     const content = await page.content();
  //     const processedContent = this.processContent(content);
  //     // console.log(`Content from URL: ${url}`);
  //     // console.log(processedContent);

  //     // Extract all links and classify them
  //     const links = await page.$$eval('a', (anchors) =>
  //       anchors.map((a) => a.href),
  //     );
  //     links.forEach((link) => {
  //       if (this.isInternal(link, url) && currentDepth < maxDepth) {
  //         this.enqueueUrl(link, currentDepth + 1);
  //       } else {
  //         this.externalLinks.add(link);
  //       }
  //     });

  //     return processedContent;
  //   } finally {
  //     await page.close();
  //   }
  // }

  // private isInternal(link: string, baseUrl: string): boolean {
  //   return new URL(link).hostname === new URL(baseUrl).hostname;
  // }

  // private async createJob(url: string) {
  //   console.log(`Creating job for URL: ${url}`);
  //   const job = await this.prisma.job.create({
  //     data: { url, status: 'started' },
  //   });
  //   console.log(`Job created with ID: ${job.jobId}`);
  //   return job;
  // }

  // private async updateJobStatus(jobId: string, status: string, data?: any) {
  //   console.log(`Updating job ${jobId} to status '${status}'.`);
  //   const updateData = { status, data };
  //   const updatedJob = await this.prisma.job.update({
  //     where: { jobId },
  //     data: updateData,
  //   });
  //   console.log(`Job ${jobId} status updated to '${status}'.`);
  //   return updatedJob;
  // }

  // private processContent(content: string): any {
  //   const dataCleaningOptions = new CreateDataPreprocessorDto();
  //   dataCleaningOptions.removeScripts = true;
  //   dataCleaningOptions.removeStyles = true;
  //   dataCleaningOptions.removeLinks = true;

  //   content = this.dataPreprocessor.cleanHtml(content, dataCleaningOptions); // Clean the HTML here
  //   // console.log(`Cleaned content from URL: ${url}`);
  //   console.log('cleaned content:', content);
  // }

  // private enqueueUrl(url: string, depth: number): void {
  //   if (!this.visitedUrls.has(url)) {
  //     this.urlQueue.push([url, depth]);
  //     this.urlDepthMap.set(url, depth);
  //     console.log(`Enqueued new URL: ${url} at depth ${depth}`);
  //   }
  // }
}
