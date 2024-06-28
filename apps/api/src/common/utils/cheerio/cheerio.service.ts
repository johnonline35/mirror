import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import {
  TaskComponentType,
  TaskComponents,
} from '../../../interfaces/task.interface';
import { TaskComponent } from '../../../components-registry/components-registry.decorator';
import { ITask } from '../../../interfaces/task.interface';
import {
  ExtractedPageData,
  LinkData,
} from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';
import { Page } from '../puppeteer/puppeteer.service';

@Injectable()
@TaskComponent(TaskComponentType.UTILITY)
export class CheerioUtilityService implements TaskComponents {
  name = 'CheerioUtility';
  description = 'Parses HTML content';
  type: TaskComponentType = TaskComponentType.UTILITY;

  private readonly logger = new Logger(CheerioUtilityService.name);

  /**
   * Loads HTML and returns the CheerioStatic object for further manipulation.
   * @param html The HTML string to be loaded.
   */
  load(html: string) {
    return cheerio.load(html);
  }

  /**
   * Extracts and cleans text from a CheerioStatic object.
   * @param $ The CheerioStatic object.
   */
  private extractAndCleanText($: cheerio.Root): string {
    // Remove specified elements
    $(
      'script, link[rel="stylesheet"], style, svg, path, meta, noscript, iframe, object, embed',
    ).remove();
    $('[style]').removeAttr('style');

    // Remove elements with no content
    $('*')
      .filter((_, el) => !$(el).html().trim())
      .remove();

    // Function to get text with proper spacing
    function getTextWithSpacing(element: cheerio.Cheerio): string {
      let text = '';
      element.contents().each((_, el) => {
        const node = $(el);
        if (el.type === 'text') {
          text += node.text();
        } else if (el.type === 'tag') {
          text += ' ' + getTextWithSpacing(node) + ' ';
        }
      });
      return text;
    }

    // Extract and clean the text
    let cleanedText = getTextWithSpacing($('body')).trim();
    cleanedText = cleanedText.replace(/\s+/g, ' '); // Collapse multiple spaces into a single space

    return cleanedText;
  }

  /**
   * Extracts page data from a given Puppeteer page and task details.
   * @param page The Puppeteer page object.
   * @param task The task object containing the URL details.
   */
  async extractPageData(page: Page, task: ITask): Promise<ExtractedPageData> {
    const html = await page.content();
    const $ = cheerio.load(html);
    const baseUrl = task.details.url;

    const getBaseDomain = (url: string) => {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.').reverse();
      if (parts.length >= 2) {
        return parts[1] + '.' + parts[0];
      }
      return hostname;
    };

    const baseDomain = getBaseDomain(baseUrl);

    const cleanedText = this.extractAndCleanText($);

    const uniqueInternalLinks = new Set<string>();
    const uniqueExternalLinks = new Set<string>();
    const internalLinks: LinkData[] = [];
    const externalLinks: LinkData[] = [];
    const uniqueImageUrls = new Set<string>();
    const imageUrls: LinkData[] = [];
    const uniqueScriptUrls = new Set<string>();
    const scriptUrls: string[] = [];
    const uniqueStylesheetUrls = new Set<string>();
    const stylesheetUrls: string[] = [];
    const metaTags: Record<string, string> = {};
    const headings: Record<string, string[]> = {
      H1: [],
      H2: [],
      H3: [],
      H4: [],
      H5: [],
      H6: [],
    };

    // Extract internal and external links
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href) {
        const resolvedUrl = new URL(href, baseUrl).href;
        const resolvedDomain = getBaseDomain(resolvedUrl);

        const linkData: LinkData = { url: resolvedUrl, name: text || href };
        if (resolvedDomain === baseDomain) {
          if (!uniqueInternalLinks.has(resolvedUrl)) {
            uniqueInternalLinks.add(resolvedUrl);
            internalLinks.push(linkData);
          }
        } else {
          if (!uniqueExternalLinks.has(resolvedUrl)) {
            uniqueExternalLinks.add(resolvedUrl);
            externalLinks.push(linkData);
          }
        }
      }
    });

    // Extract image URLs
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt');
      const parentDivClass = $(el).closest('div').attr('class');
      if (src && !uniqueImageUrls.has(src)) {
        uniqueImageUrls.add(src);
        imageUrls.push({ url: src, name: alt || parentDivClass || '' });
      }
    });

    // Extract meta tags
    $('meta').each((_, el) => {
      const name = $(el).attr('name') || $(el).attr('property');
      const content = $(el).attr('content');
      if (name && content) {
        metaTags[name] = content;
      }
    });

    // Extract title
    const title = $('title').text().trim();

    // Extract headings
    Object.keys(headings).forEach((tag) => {
      $(tag).each((_, el) => {
        headings[tag].push($(el).text().trim());
      });
    });

    // Extract script URLs
    $('script').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        const resolvedUrl = new URL(src, baseUrl).href;
        if (!uniqueScriptUrls.has(resolvedUrl)) {
          uniqueScriptUrls.add(resolvedUrl);
          scriptUrls.push(resolvedUrl);
        }
      }
    });

    // Extract stylesheet URLs
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        const resolvedUrl = new URL(href, baseUrl).href;
        if (!uniqueStylesheetUrls.has(resolvedUrl)) {
          uniqueStylesheetUrls.add(resolvedUrl);
          stylesheetUrls.push(resolvedUrl);
        }
      }
    });

    this.logger.log(`Extracted homepage data from URL`);

    const extractedPageData: ExtractedPageData = {
      cleanedText,
      metaTags,
      title,
      headings,
      internalLinks,
      externalLinks,
      imageUrls,
      scriptUrls,
      stylesheetUrls,
    };

    return extractedPageData;
  }
}
