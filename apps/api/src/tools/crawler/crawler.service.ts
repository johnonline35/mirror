import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { CrawlRequestDto } from './dto/CrawlRequestDto.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  PuppeteerService,
  Page,
} from '../../utilities/puppeteer/puppeteer.service';
import * as cheerio from 'cheerio';
import { retryOperation, RetryOptions } from '../../utilities/retry.utility';
import { ITool } from '../../interfaces/tool.interface';
import { ITask } from '../../interfaces/task.interface';

@Injectable()
export class CrawlHomepageService implements ITool {
  private readonly logger = new Logger(CrawlHomepageService.name);

  constructor(
    private prisma: PrismaService,
    private puppeteerService: PuppeteerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async execute(task: ITask): Promise<any> {
    const crawlRequestDto = new CrawlRequestDto();
    crawlRequestDto.url = task.details.url;
    return this.crawlUrl(crawlRequestDto);
  }

  async reflect(result: any): Promise<any> {
    return { needsImprovement: false }; // Placeholder
  }

  async refine(task: ITask, feedback: any): Promise<ITask> {
    return task; // Placeholder
  }

  private async crawlUrl(crawlRequestDto: CrawlRequestDto): Promise<any> {
    const cacheKey = `crawl:${crawlRequestDto.url}`;
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      this.logger.log(`Cache hit for URL: ${crawlRequestDto.url}`);
      return cachedResult;
    }

    this.logger.log(`Starting to crawl URL: ${crawlRequestDto.url}`);
    const job = await this.createJob(crawlRequestDto.url);
    const browser = await this.puppeteerService.launchBrowser();

    try {
      const page = await this.puppeteerService.createPage(browser);
      const result = await this.crawlWithRetry(crawlRequestDto, page);
      await this.updateJobStatus(job.jobId, 'done', result);
      await this.cacheManager.set(cacheKey, result, 600); // Cache for 10 minutes
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
      maxTimeout: 60000,
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
      timeout: 60000,
    });

    const extractedHomePage = await this.extractHomePageData(page);
    return { extractedHomePage };
  }

  private async extractHomePageData(page: Page): Promise<string> {
    const html = await page.content();
    const $ = cheerio.load(html);

    $(
      'script, link[rel="stylesheet"], style, svg, path, meta, noscript, iframe, object, embed',
    ).remove();
    $('[style]').removeAttr('style');
    $('*')
      .filter((_, el) => !$(el).html().trim())
      .remove();

    let cleanedText = $('body').text().trim();
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

    const summary = `The text from the homepage: "${cleanedText}"`;
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

// import { Injectable, Logger } from '@nestjs/common';
// import { CrawlRequestDto } from './dto/CrawlRequestDto.dto';
// import { PrismaService } from '../../prisma/prisma.service';
// import * as cheerio from 'cheerio';
// import { CrawlerStrategyFactory } from './strategies/crawler-strategy.factory';
// import {
//   PuppeteerService,
//   Page,
// } from '../utilities/puppeteer/puppeteer.service';
// import { retryOperation, RetryOptions } from '../utilities/retry.utility';
// import { StrategyContext } from './strategies/crawler-strategy.interface';

// @Injectable()
// export class CrawlerService {
//   private readonly logger = new Logger(CrawlerService.name);

//   constructor(
//     private prisma: PrismaService,
//     private crawlerFactory: CrawlerStrategyFactory,
//     private puppeteerService: PuppeteerService,
//   ) {}

//   async crawlUrl(crawlRequestDto: CrawlRequestDto): Promise<any> {
//     this.logger.log(`Starting to crawl URL: ${crawlRequestDto.url}`);
//     const job = await this.createJob(crawlRequestDto.url);
//     const browser = await this.puppeteerService.launchBrowser();

//     try {
//       const page = await this.puppeteerService.createPage(browser);
//       const result = await this.crawlWithRetry(crawlRequestDto, page);
//       await this.updateJobStatus(job.jobId, 'done', result);
//       return result;
//     } catch (error) {
//       this.logger.error(`Crawl failed`, error.stack);
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
//       maxTimeout: 60000,
//       logLevel: 'verbose',
//       customErrorHandler: (error) => {
//         this.logger.error('Encountered an error:', error);
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
//     this.logger.log(`Navigating to URL: ${crawlRequestDto.url}`);
//     await page.goto(crawlRequestDto.url, {
//       waitUntil: 'networkidle0',
//       timeout: 60000,
//     });

//     const extractedHomePage = await this.extractHomePageData(page);

//     const strategy = await this.crawlerFactory.getStrategy(extractedHomePage);
//     if (strategy) {
//       const strategyContext: StrategyContext = {
//         crawlRequestDto: crawlRequestDto,
//         page: page,
//       };

//       return strategy.execute(strategyContext);
//     } else {
//       this.logger.warn('No strategy returned');
//       return null;
//     }
//   }

//   private async extractHomePageData(page: Page): Promise<string> {
//     const html = await page.content();
//     // this.logger.log(`Raw HTML content: ${html}`);

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
//     let cleanedText = $('body').text().trim();

//     // Clean up the white space
//     cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

//     const summary = `The text from the homepage: "${cleanedText}"`;

//     this.logger.log(`Extracted and cleaned homepage data: ${summary}`);
//     return summary;
//   }

//   private async createJob(url: string) {
//     this.logger.log(`Creating job for URL: ${url}`);
//     return await this.prisma.job.create({
//       data: { url, status: 'started' },
//     });
//   }

//   private async updateJobStatus(jobId: string, status: string, data?: any) {
//     this.logger.log(`Updating job status for ${jobId} to ${status}`);
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
//       this.logger.error(
//         `Failed to update job status for ${jobId}`,
//         error.stack,
//       );
//       throw error;
//     }
//   }
// }
