import { Injectable, Logger } from '@nestjs/common';
import { CrawlRequestDto } from './dto/CrawlRequestDto.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as cheerio from 'cheerio';
import { CrawlerStrategyFactory } from '../strategies/crawler-strategies/crawler-strategy.factory';
import {
  PuppeteerService,
  Page,
} from '../utilities/puppeteer/puppeteer.service';
import { retryOperation, RetryOptions } from '../utilities/retry.utility';
import { StrategyContext } from '../strategies/crawler-strategies/crawler-strategy.interface';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private prisma: PrismaService,
    private crawlerFactory: CrawlerStrategyFactory,
    private puppeteerService: PuppeteerService,
  ) {}

  async crawlUrl(crawlRequestDto: CrawlRequestDto): Promise<any> {
    this.logger.log(`Starting to crawl URL: ${crawlRequestDto.url}`);
    const job = await this.createJob(crawlRequestDto.url);
    const browser = await this.puppeteerService.launchBrowser();

    try {
      const page = await this.puppeteerService.createPage(browser);
      const result = await this.crawlWithRetry(crawlRequestDto, page);
      await this.updateJobStatus(job.jobId, 'done', result);
      return result;
    } catch (error) {
      this.logger.error(`Crawl failed`, error.stack);
      await this.updateJobStatus(job.jobId, 'failed');
      throw error;
    } finally {
      await browser.close();
    }
  }

  private async crawlWithRetry(
    crawlRequestDto: CrawlRequestDto,
    page: Page,
  ): Promise<any> {
    const retryOptions: RetryOptions = {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 30000,
      logLevel: 'verbose',
      customErrorHandler: (error) => {
        this.logger.error('Encountered an error:', error);
      },
    };

    return retryOperation(
      () => this.performCrawl(crawlRequestDto, page),
      retryOptions,
    );
  }

  private async performCrawl(
    crawlRequestDto: CrawlRequestDto,
    page: Page,
  ): Promise<any> {
    this.logger.log(`Navigating to URL: ${crawlRequestDto.url}`);
    await page.goto(crawlRequestDto.url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    const extractedHomePage = await this.extractHomePageData(page);

    const strategy = await this.crawlerFactory.getStrategy(extractedHomePage);
    if (strategy) {
      const strategyContext: StrategyContext = {
        crawlRequestDto: crawlRequestDto,
        page: page,
      };

      return strategy.execute(strategyContext);
    } else {
      this.logger.warn('No strategy returned');
      return null;
    }
  }

  private async extractHomePageData(page: Page): Promise<string> {
    const html = await page.content();
    this.logger.log(`Raw HTML content: ${html}`);

    const $ = cheerio.load(html);

    // Remove unnecessary elements
    $(
      'script, link[rel="stylesheet"], style, svg, path, meta, noscript, iframe, object, embed',
    ).remove();

    // Remove style attributes
    $('[style]').removeAttr('style');

    // Remove empty elements
    $('*')
      .filter((_, el) => !$(el).html().trim())
      .remove();

    // Extract text content
    let cleanedText = $('body').text().trim();

    // Clean up the white space
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

    const summary = `The raw text from the homepage html with basic style, svg, path, meta tags removed is: "${cleanedText}"`;

    this.logger.log(`Extracted and cleaned homepage data: ${summary}`);
    return summary;
  }

  private async createJob(url: string) {
    this.logger.log(`Creating job for URL: ${url}`);
    return await this.prisma.job.create({
      data: { url, status: 'started' },
    });
  }

  private async updateJobStatus(jobId: string, status: string, data?: any) {
    this.logger.log(`Updating job status for ${jobId} to ${status}`);
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
      this.logger.error(
        `Failed to update job status for ${jobId}`,
        error.stack,
      );
      throw error;
    }
  }
}

// import { Injectable } from '@nestjs/common';
// import { CrawlRequestDto } from './dto/CrawlRequestDto.dto';
// import { PrismaService } from '../../prisma/prisma.service';
// import * as cheerio from 'cheerio';
// import { CrawlerStrategyFactory } from '../strategies/crawler-strategies/crawler-strategy.factory';
// import {
//   PuppeteerService,
//   Page,
// } from '../utilities/puppeteer/puppeteer.service';
// import { retryOperation, RetryOptions } from '../utilities/retry.utility';
// import { StrategyContext } from '../strategies/crawler-strategies/crawler-strategy.interface';

// @Injectable()
// export class CrawlerService {
//   constructor(
//     private prisma: PrismaService,
//     private crawlerFactory: CrawlerStrategyFactory,
//     private puppeteerService: PuppeteerService,
//   ) {}

//   async crawlUrl(crawlRequestDto: CrawlRequestDto): Promise<any> {
//     console.log(`Starting to crawl URL: ${crawlRequestDto.url}`);
//     const job = await this.createJob(crawlRequestDto.url);
//     const browser = await this.puppeteerService.launchBrowser();

//     try {
//       const page = await this.puppeteerService.createPage(browser);
//       const result = await this.crawlWithRetry(crawlRequestDto, page);
//       await this.updateJobStatus(job.jobId, 'done', result);
//       return result;
//     } catch (error) {
//       console.error(`Crawl failed`, error);
//       await this.updateJobStatus(job.jobId, 'failed');
//       throw error;
//     } finally {
//       await browser.close();
//     }
//   }

//   private async crawlWithRetry(
//     crawlRequestDto: CrawlRequestDto,
//     page: Page,
//   ): Promise<any> {
//     const retryOptions: RetryOptions = {
//       retries: 3,
//       factor: 2,
//       minTimeout: 1000,
//       maxTimeout: 30000,
//       logLevel: 'verbose',
//       customErrorHandler: (error) => {
//         console.error('Encountered an error:', error);
//       },
//     };

//     return retryOperation(
//       () => this.performCrawl(crawlRequestDto, page),
//       retryOptions,
//     );
//   }

//   private async performCrawl(
//     crawlRequestDto: CrawlRequestDto,
//     page: Page,
//   ): Promise<any> {
//     await page.goto(crawlRequestDto.url, {
//       waitUntil: 'networkidle0',
//       timeout: 30000,
//     });

//     const homePageSummary = await this.extractHomePageData(page);
//     console.log(`Home Page Summary: ${homePageSummary}`);

//     const strategy = await this.crawlerFactory.getStrategy(homePageSummary);
//     if (strategy) {
//       const strategyContext: StrategyContext = {
//         crawlRequestDto: crawlRequestDto,
//         page: page,
//       };

//       return strategy.execute(strategyContext);
//     } else {
//       console.log('No strategy returned');
//       return null;
//     }
//   }

//   private async extractHomePageData(page: Page): Promise<string> {
//     const html = await page.content();
//     const $ = cheerio.load(html);

//     // Remove unnecessary elements
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
//     const cleanedText = $('body').text().trim();

//     const summary = `The raw text from the homepage html with basic style, svg, path, meta tags removed is: "${cleanedText}"`;

//     return summary;
//   }

//   // private async extractHomePageData(page: Page): Promise<string> {
//   //   const html = await page.content();
//   //   const $ = cheerio.load(html);
//   //   const rawHomepageData = $(
//   //     'script, link[rel="stylesheet"], style, svg, path, meta',
//   //   ).remove();
//   //   $('*').removeAttr('style');

//   //   const summary = `The raw text from the homepage with basic style, svg, path, meta tags removed is: "${rawHomepageData}", `;

//   //   return summary;
//   // }

//   private async createJob(url: string) {
//     console.log(`Creating job for URL: ${url}`);
//     return await this.prisma.job.create({
//       data: { url, status: 'started' },
//     });
//   }

//   private async updateJobStatus(jobId: string, status: string, data?: any) {
//     console.log(`Updating job status for ${jobId} to ${status}`);
//     const dataToUpdate = {
//       status,
//       data: JSON.stringify(data),
//     };
//     try {
//       return await this.prisma.job.update({
//         where: { jobId },
//         data: dataToUpdate,
//       });
//     } catch (error) {
//       console.error(`Failed to update job status for ${jobId}`, error);
//       throw error;
//     }
//   }
// }
