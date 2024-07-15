import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  PuppeteerUtilityService,
  Page,
} from '../../../../../common/utils/puppeteer/puppeteer.service';
import {
  retryOperation,
  RetryOptions,
} from '../../../../../common/utils/retry.utility';
import { ITask } from '../../../../../interfaces/task.interface';
import { ICrawlerStrategy } from '../crawler-strategy.interface';
import { ExtractedPageData } from '../crawler-strategy.interface';
import { CheerioUtilityService } from '../../../../../common/utils/cheerio/cheerio.service';

@Injectable()
export class CrawlPuppeteerStrategy implements ICrawlerStrategy {
  private readonly logger = new Logger(CrawlPuppeteerStrategy.name);

  constructor(
    private puppeterUtilityService: PuppeteerUtilityService,
    private cheerioUtilityService: CheerioUtilityService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async execute(task: ITask, url?: string): Promise<ExtractedPageData> {
    this.logger.log('executing task:', task);
    if (url) {
      const extractedPageData = await this.crawlUrl(url);
      return extractedPageData;
    } else {
      const url = task.details.url;
      const extractedPageData = await this.crawlUrl(url);
      return extractedPageData;
    }
  }

  private async crawlUrl(url: string): Promise<ExtractedPageData> {
    this.logger.log(`Starting to crawl URL: ${url}`);
    const browser = await this.puppeterUtilityService.launchBrowser();

    try {
      const page = await this.puppeterUtilityService.createPage(browser);
      const extractedPageData = await this.crawlWithRetry(url, page);
      return extractedPageData;
    } catch (error) {
      this.logger.error(`Crawl failed`, error.stack);
      throw error;
    } finally {
      await browser.close();
    }
  }

  private async crawlWithRetry(
    url: string,
    page: Page,
  ): Promise<ExtractedPageData> {
    const retryOptions: RetryOptions = {
      retries: 10,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 60000,
      logLevel: 'verbose',
      customErrorHandler: (error) => {
        this.logger.error('Encountered an error:', error);
      },
    };

    return retryOperation(() => this.extractPageData(url, page), retryOptions);
  }

  private async scrollToBottom(page: Page) {
    const getRandomInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;
    const timeout = (milliseconds: number): Promise<void> => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };

    const scrollDown = async () => {
      const distance = getRandomInt(107, 311); // Random distance between 100 and 300 pixels
      await page.evaluate(async (distance) => {
        window.scrollBy(0, distance);
      }, distance);
      const delay = getRandomInt(306, 1287); // Random delay
      await timeout(delay);
    };

    let previousHeight = await page.evaluate('document.body.scrollHeight');
    let scrollAttempts = 0;

    while (scrollAttempts < 10) {
      // Increase the number of attempts if necessary
      await scrollDown();
      const newHeight = await page.evaluate('document.body.scrollHeight');
      if (newHeight === previousHeight) {
        scrollAttempts++;
        if (scrollAttempts >= 3) {
          // Allow a few retries to handle lazy-loaded content
          break;
        }
      } else {
        previousHeight = newHeight;
        scrollAttempts = 0; // Reset attempts if new content is loaded
      }
    }
  }

  // private async extractPageData(
  //   url: string,
  //   page: Page,
  // ): Promise<ExtractedPageData> {
  //   console.log('extract page data from:', url);
  //   this.logger.log(`Navigating to URL: ${url}`);
  //   await page.goto(url, {
  //     waitUntil: 'networkidle0',
  //     timeout: 60000,
  //   });

  //   console.log('Started scrolling');

  //   // Scroll to the bottom or handle infinite scrolling
  //   await this.scrollToBottom(page);

  //   console.log('Finished scrolling');

  //   const extractedPageData = await this.cheerioUtilityService.extractPageData(
  //     page,
  //     url,
  //   );
  //   return extractedPageData;
  // }

  private async extractPageData(
    url: string,
    page: Page,
  ): Promise<ExtractedPageData> {
    this.logger.log(`Navigating to URL: ${url} at ${new Date().toISOString()}`);

    try {
      const navigationStart = Date.now();
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 60000,
      });
      const navigationEnd = Date.now();
      this.logger.log(
        `Navigation to ${url} took ${navigationEnd - navigationStart}ms`,
      );

      this.logger.log('Started scrolling');
      const scrollStart = Date.now();

      // Scroll to the bottom or handle infinite scrolling
      await this.scrollToBottom(page);

      const scrollEnd = Date.now();
      this.logger.log(`Scrolling took ${scrollEnd - scrollStart}ms`);

      const extractionStart = Date.now();
      const extractedPageData =
        await this.cheerioUtilityService.extractPageData(page, url);
      const extractionEnd = Date.now();
      this.logger.log(
        `Data extraction took ${extractionEnd - extractionStart}ms`,
      );

      return extractedPageData;
    } catch (error) {
      this.logger.error(
        `Failed to extract page data from ${url}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw the error after logging it
    }
  }
}
