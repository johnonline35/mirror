import { Browser } from 'puppeteer';
import { PuppeteerService } from '../../../utilities/puppeteer/puppeteer.service';
import { CheerioService } from '../../../utilities/cheerio/cheerio.service';
import { CrawlRequestDto } from '../../../crawler/dto/CrawlRequestDto.dto';
import { CrawlerStrategy, StrategyContext } from '../crawler-strategy.type';
import { retryOperation, RetryOptions } from '../../../utilities/retry.utility';
import { PrismaService } from '../../../../prisma/prisma.service';

export class FallbackStrategy implements CrawlerStrategy {
  private urlQueue: [string, number][] = [];
  private visitedUrls = new Set<string>();
  private externalLinks = new Set<string>();
  private urlDepthMap = new Map<string, number>();

  constructor(
    private prismaService: PrismaService,
    private puppeteerService: PuppeteerService,
    private cheerioService: CheerioService,
  ) {
    console.log('FallbackStrategy instantiated:', new Date().toISOString());
    console.log('PuppeteerService available:', puppeteerService !== undefined);
  }

  async executeStrategy(context: StrategyContext): Promise<any> {
    const { crawlRequestDto, page, currentDepth = 0 } = context;
    console.log(
      `Executing strategy for URL: ${crawlRequestDto.url} with depth limit: ${crawlRequestDto.maxDepth}`,
    );

    // Example usage of page, such as checking if the page is accessible or loading initial data
    const isAccessible = await page
      .goto(crawlRequestDto.url, { waitUntil: 'domcontentloaded' })
      .then(
        () => true,
        () => false,
      );
    if (!isAccessible) {
      console.error('Failed to access URL:', crawlRequestDto.url);
      return []; // Returning empty result or handling error appropriately
    }

    this.enqueueUrl(crawlRequestDto.url, currentDepth);
    return await this.crawlUrl(crawlRequestDto);
  }

  async crawlUrl(crawlRequestDto: CrawlRequestDto): Promise<any[]> {
    console.log(`Starting to crawl URL: ${crawlRequestDto.url}`);

    console.log(
      'About to launch browser with puppeteerService:',
      this.puppeteerService,
    );
    if (!this.puppeteerService) {
      console.error('PuppeteerService is not initialized');
      throw new Error('PuppeteerService is not initialized');
    }
    const browser = await this.puppeteerService.launchBrowser();
    const crawlResults = [];

    try {
      while (this.urlQueue.length > 0) {
        const [url, depth] = this.urlQueue.shift();
        if (!this.visitedUrls.has(url) && depth <= crawlRequestDto.maxDepth) {
          this.visitedUrls.add(url);
          const retryOptions: RetryOptions = {
            retries: 3,
            minTimeout: 1000,
            maxTimeout: 30000,
            factor: 2,
            onRetry: (error, attemptNumber) => {
              console.log(
                `Attempt ${attemptNumber} failed. There are ${3 - attemptNumber} retries left.`,
              );
            },
          };
          try {
            const result = await retryOperation(
              () =>
                this.crawlPage(url, browser, depth, crawlRequestDto.maxDepth),
              retryOptions,
            );
            crawlResults.push(result, depth);
            console.log(`Crawling completed for URL: ${url}`);
          } catch (error) {
            console.error(
              `Crawling failed for URL: ${url} with error: ${error}`,
            );
            // Optionally handle specific failures per URL
          }
        }
      }
    } catch (error) {
      console.error(`Crawl failed`, error);
      throw error;
    } finally {
      await browser.close();
    }
    return crawlResults;
  }

  private async crawlPage(
    url: string,
    browser: Browser,
    currentDepth: number,
    maxDepth: number,
  ): Promise<any> {
    const page = await this.puppeteerService.createPage(browser);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    const htmlContent = await page.content();
    await page.close();

    const processedContent = this.processContent(htmlContent);
    this.processLinks(htmlContent, url, currentDepth, maxDepth);

    return processedContent;
  }

  private isInternal(link: string, baseUrl: string): boolean {
    return new URL(link, baseUrl).hostname === new URL(baseUrl).hostname;
  }

  private processContent(htmlContent: string): string {
    const $ = this.cheerioService.load(htmlContent);
    $('script, link[rel="stylesheet"], style, svg, path, meta').remove();
    $('*').removeAttr('style');
    console.log('Processed content:', $.html());
    return $.html();
  }

  private processLinks(
    htmlContent: string,
    url: string,
    currentDepth: number,
    maxDepth: number,
  ): void {
    const $ = this.cheerioService.load(htmlContent);
    const links = $('a')
      .map((_, link) => $(link).attr('href'))
      .get();

    links.forEach((link) => {
      if (link && this.isInternal(link, url) && currentDepth < maxDepth) {
        this.enqueueUrl(link, currentDepth + 1); // Enqueue deeper internal links
      } else {
        this.externalLinks.add(link); // Collect external links
      }
    });
  }

  private enqueueUrl(url: string, depth: number): void {
    if (!this.visitedUrls.has(url)) {
      this.urlQueue.push([url, depth]);
      this.urlDepthMap.set(url, depth);
      console.log(`Enqueued new URL: ${url} at depth ${depth}`);
    }
  }
}
