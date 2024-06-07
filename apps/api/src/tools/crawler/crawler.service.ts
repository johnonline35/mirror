import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  PuppeteerUtilityService,
  Page,
} from '../../utilities/puppeteer/puppeteer.service';
import * as cheerio from 'cheerio';
import { retryOperation, RetryOptions } from '../../utilities/retry.utility';
import { ITool } from '../../interfaces/tool.interface';
import { ITask } from '../../interfaces/task.interface';
import { TaskComponent } from '../../components-registry/components-registry.decorator';

@Injectable()
@TaskComponent('tool')
export class CrawlHomepageService implements ITool<ITask> {
  name = 'CrawlHomepageService';
  description =
    'Crawls homepage to classify the type of website it is and then extracts data for further decision making and crawling';
  type: 'tool';

  private readonly logger = new Logger(CrawlHomepageService.name);

  constructor(
    private puppeterUtilityService: PuppeteerUtilityService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async execute(task: ITask): Promise<any> {
    this.logger.log('executing task:', task);
    const extractedHomePageData = await this.crawlUrl(task);
    return extractedHomePageData;
  }

  private async crawlUrl(task: ITask): Promise<any> {
    const cacheKey = `crawl:${task.details.url}`;
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      this.logger.log(`Cache hit for URL: ${task.details.url}`);
      return cachedResult;
    }

    this.logger.log(`Starting to crawl URL: ${task.details.url}`);
    const browser = await this.puppeterUtilityService.launchBrowser();

    try {
      const page = await this.puppeterUtilityService.createPage(browser);
      const extractedHomePageData = await this.crawlWithRetry(task, page);
      await this.cacheManager.set(cacheKey, extractedHomePageData, 600); // Cache for 10 minutes
      return extractedHomePageData;
    } catch (error) {
      this.logger.error(`Crawl failed`, error.stack);
      throw error;
    } finally {
      await browser.close();
    }
  }

  private async crawlWithRetry(task: ITask, page: Page): Promise<any> {
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

    return retryOperation(() => this.performCrawl(task, page), retryOptions);
  }

  private async performCrawl(task: ITask, page: Page): Promise<any> {
    this.logger.log(`Navigating to URL: ${task.details.url}`);
    await page.goto(task.details.url, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    const extractedHomePageData = await this.extractHomePageData(page);
    return extractedHomePageData;
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

    this.logger.log(`Extracted and cleaned homepage data: ${cleanedText}`);
    return cleanedText;
  }
}
