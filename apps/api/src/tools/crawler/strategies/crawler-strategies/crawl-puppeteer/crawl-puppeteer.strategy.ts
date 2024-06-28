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

  async execute(task: ITask): Promise<ExtractedPageData> {
    this.logger.log('executing task:', task);
    const extractedPageData = await this.crawlUrl(task);
    return extractedPageData;
  }

  private async crawlUrl(task: ITask): Promise<ExtractedPageData> {
    const cacheKey = `crawl:${task.details.url}`;
    const cachedResult =
      await this.cacheManager.get<ExtractedPageData>(cacheKey);

    if (cachedResult) {
      this.logger.log(`Cache hit for URL: ${task.details.url}`);
      return cachedResult;
    }

    this.logger.log(`Starting to crawl URL: ${task.details.url}`);
    const browser = await this.puppeterUtilityService.launchBrowser();

    try {
      const page = await this.puppeterUtilityService.createPage(browser);
      const extractedPageData = await this.crawlWithRetry(task, page);
      await this.cacheManager.set(cacheKey, extractedPageData, 600); // Cache for 10 minutes
      return extractedPageData;
    } catch (error) {
      this.logger.error(`Crawl failed`, error.stack);
      throw error;
    } finally {
      await browser.close();
    }
  }

  private async crawlWithRetry(
    task: ITask,
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

    return retryOperation(() => this.extractPageData(task, page), retryOptions);
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

  private async extractPageData(
    task: ITask,
    page: Page,
  ): Promise<ExtractedPageData> {
    console.log('task details', task.details);
    this.logger.log(`Navigating to URL: ${task.details.url}`);
    await page.goto(task.details.url, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    console.log('Started scrolling');

    // Scroll to the bottom or handle infinite scrolling
    await this.scrollToBottom(page);

    console.log('Finished scrolling');

    const extractedPageData = await this.cheerioUtilityService.extractPageData(
      page,
      task,
    );
    return extractedPageData;
  }
}

// private async extractPageData(
//   page: Page,
//   task: ITask,
// ): Promise<ExtractedPageData> {
//   const html = await page.content();
//   const $ = cheerio.load(html);
//   const baseUrl = task.details.url;

//   const getBaseDomain = (url: string) => {
//     const hostname = new URL(url).hostname;
//     const parts = hostname.split('.').reverse();
//     if (parts.length >= 2) {
//       return parts[1] + '.' + parts[0];
//     }
//     return hostname;
//   };

//   const baseDomain = getBaseDomain(baseUrl);

//   function extractAndCleanText(html: string): string {
//     const $ = cheerio.load(html);

//     // Remove specified elements
//     $(
//       'script, link[rel="stylesheet"], style, svg, path, meta, noscript, iframe, object, embed',
//     ).remove();
//     $('[style]').removeAttr('style');

//     // Remove elements with no content
//     $('*')
//       .filter((_, el) => !$(el).html().trim())
//       .remove();

//     // Function to get text with proper spacing
//     function getTextWithSpacing(element: cheerio.Cheerio): string {
//       let text = '';
//       element.contents().each((_, el) => {
//         const node = $(el);
//         if (el.type === 'text') {
//           text += node.text();
//         } else if (el.type === 'tag') {
//           text += ' ' + getTextWithSpacing(node) + ' ';
//         }
//       });
//       return text;
//     }

//     // Extract and clean the text
//     let cleanedText = getTextWithSpacing($('body')).trim();
//     cleanedText = cleanedText.replace(/\s+/g, ' '); // Collapse multiple spaces into a single space

//     return cleanedText;
//   }

//   const cleanedText = extractAndCleanText(html);

//   // This function returns very raw text that isnt cleaned
//   // const extractedHomePageText = $('body')
//   //   .text()
//   //   .trim()
//   //   .replace(/\s+/g, ' ')
//   //   .trim();

//   const uniqueInternalLinks = new Set<string>();
//   const uniqueExternalLinks = new Set<string>();
//   const internalLinks: LinkData[] = [];
//   const externalLinks: LinkData[] = [];
//   const uniqueImageUrls = new Set<string>();
//   const imageUrls: LinkData[] = [];
//   const uniqueScriptUrls = new Set<string>();
//   const scriptUrls: string[] = [];
//   const uniqueStylesheetUrls = new Set<string>();
//   const stylesheetUrls: string[] = [];
//   const metaTags: Record<string, string> = {};
//   const headings: Record<string, string[]> = {
//     H1: [],
//     H2: [],
//     H3: [],
//     H4: [],
//     H5: [],
//     H6: [],
//   };

//   // Extract internal and external links
//   $('a').each((_, el) => {
//     const href = $(el).attr('href');
//     const text = $(el).text().trim();
//     if (href) {
//       const resolvedUrl = new URL(href, baseUrl).href;
//       const resolvedDomain = getBaseDomain(resolvedUrl);

//       const linkData: LinkData = { url: resolvedUrl, name: text || href };
//       if (resolvedDomain === baseDomain) {
//         if (!uniqueInternalLinks.has(resolvedUrl)) {
//           uniqueInternalLinks.add(resolvedUrl);
//           internalLinks.push(linkData);
//         }
//       } else {
//         if (!uniqueExternalLinks.has(resolvedUrl)) {
//           uniqueExternalLinks.add(resolvedUrl);
//           externalLinks.push(linkData);
//         }
//       }
//     }
//   });

//   // Extract image URLs
//   $('img').each((_, el) => {
//     const src = $(el).attr('src');
//     const alt = $(el).attr('alt');
//     const parentDivClass = $(el).closest('div').attr('class');
//     if (src && !uniqueImageUrls.has(src)) {
//       uniqueImageUrls.add(src);
//       imageUrls.push({ url: src, name: alt || parentDivClass || '' });
//     }
//   });

//   // Extract meta tags
//   $('meta').each((_, el) => {
//     const name = $(el).attr('name') || $(el).attr('property');
//     const content = $(el).attr('content');
//     if (name && content) {
//       metaTags[name] = content;
//     }
//   });

//   // Extract title
//   const title = $('title').text().trim();

//   // Extract headings
//   Object.keys(headings).forEach((tag) => {
//     $(tag).each((_, el) => {
//       headings[tag].push($(el).text().trim());
//     });
//   });

//   // Extract script URLs
//   $('script').each((_, el) => {
//     const src = $(el).attr('src');
//     if (src) {
//       const resolvedUrl = new URL(src, baseUrl).href;
//       if (!uniqueScriptUrls.has(resolvedUrl)) {
//         uniqueScriptUrls.add(resolvedUrl);
//         scriptUrls.push(resolvedUrl);
//       }
//     }
//   });

//   // Extract stylesheet URLs
//   $('link[rel="stylesheet"]').each((_, el) => {
//     const href = $(el).attr('href');
//     if (href) {
//       const resolvedUrl = new URL(href, baseUrl).href;
//       if (!uniqueStylesheetUrls.has(resolvedUrl)) {
//         uniqueStylesheetUrls.add(resolvedUrl);
//         stylesheetUrls.push(resolvedUrl);
//       }
//     }
//   });

//   this.logger.log(`Extracted homepage data from URL`);

//   const extractedPageData: ExtractedPageData = {
//     cleanedText,
//     metaTags,
//     title,
//     headings,
//     internalLinks,
//     externalLinks,
//     imageUrls,
//     scriptUrls,
//     stylesheetUrls,
//   };

//   console.log('extractedPageData', extractedPageData.internalLinks);
//   return extractedPageData;
// }
// }
