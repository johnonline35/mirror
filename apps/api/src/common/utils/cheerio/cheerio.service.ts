import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import {
  TaskComponentType,
  TaskComponents,
} from '../../../interfaces/task.interface';
import { TaskComponent } from '../../../components-registry/components-registry.decorator';
import {
  ExtractedPageData,
  LinkData,
} from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';
// import { Page } from '../puppeteer/puppeteer.service';
import { Page } from 'puppeteer';

@Injectable()
@TaskComponent(TaskComponentType.UTILITY)
export class CheerioUtilityService implements TaskComponents {
  name = 'CheerioUtility';
  description = 'Parses HTML content';
  type: TaskComponentType = TaskComponentType.UTILITY;

  private readonly logger = new Logger(CheerioUtilityService.name);

  load(html: string) {
    return cheerio.load(html);
  }

  private extractAndCleanText($: cheerio.Root): string {
    $(
      'script, link[rel="stylesheet"], style, svg, path, meta, noscript, iframe, object, embed',
    ).remove();
    $('[style]').removeAttr('style');
    $('*')
      .filter((_, el) => !$(el).html().trim())
      .remove();

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

    let cleanedText = getTextWithSpacing($('body')).trim();
    cleanedText = cleanedText.replace(/\s+/g, ' ');

    return cleanedText;
  }

  private extractCompletePage($: cheerio.Root, baseUrl: string): string {
    const elements = [];

    function resolveUrl(url: string) {
      return new URL(url, baseUrl).href;
    }

    function traverse(element: cheerio.Cheerio) {
      element.contents().each((_, el) => {
        const node = $(el);
        if (el.type === 'text') {
          elements.push(node.text().trim());
        } else if (el.type === 'tag') {
          const tagName = el.tagName.toLowerCase();
          if (
            [
              'a',
              'img',
              'script',
              'style',
              'link',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
            ].includes(tagName)
          ) {
            let info = '';
            switch (tagName) {
              case 'a':
                const href = node.attr('href');
                if (href) {
                  info = `Link: ${resolveUrl(href)} (${node.text().trim()})`;
                }
                break;
              case 'img':
                const src = node.attr('src');
                if (src) {
                  info = `Image: ${resolveUrl(src)} (${node.attr('alt') || ''})`;
                }
                break;
              case 'script':
                const scriptSrc = node.attr('src');
                if (scriptSrc) {
                  info = `Script: ${resolveUrl(scriptSrc)}`;
                }
                break;
              case 'link':
                if (node.attr('rel') === 'stylesheet') {
                  const linkHref = node.attr('href');
                  if (linkHref) {
                    info = `Stylesheet: ${resolveUrl(linkHref)}`;
                  }
                }
                break;
              case 'h1':
              case 'h2':
              case 'h3':
              case 'h4':
              case 'h5':
              case 'h6':
                info = `Heading (${tagName.toUpperCase()}): ${node.text().trim()}`;
                break;
            }
            elements.push(info);
          }
          traverse(node);
        }
      });
    }

    traverse($('body'));
    return elements.filter(Boolean).join(' ');
  }

  async extractPageData(page: Page, url: string): Promise<ExtractedPageData> {
    const html = await page.content();
    const $ = cheerio.load(html);
    const baseUrl = url;

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
    const completePage = this.extractCompletePage($, baseUrl);

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

    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt');
      const parentDivClass = $(el).closest('div').attr('class');
      if (src && !uniqueImageUrls.has(src)) {
        uniqueImageUrls.add(src);
        imageUrls.push({
          url: new URL(src, baseUrl).href,
          name: alt || parentDivClass || '',
        });
      }
    });

    $('meta').each((_, el) => {
      const name = $(el).attr('name') || $(el).attr('property');
      const content = $(el).attr('content');
      if (name && content) {
        metaTags[name] = content;
      }
    });

    const title = $('title').text().trim();

    Object.keys(headings).forEach((tag) => {
      $(tag).each((_, el) => {
        headings[tag].push($(el).text().trim());
      });
    });

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

    this.logger.log(`Extracted data from URL`);

    const extractedPageData: ExtractedPageData = {
      url,
      cleanedText,
      metaTags,
      title,
      headings,
      internalLinks,
      externalLinks,
      imageUrls,
      scriptUrls,
      stylesheetUrls,
      completePage,
    };

    return extractedPageData;
  }

  async extractPageDataFromHtml(
    html: string,
    url: string,
  ): Promise<ExtractedPageData> {
    const $ = this.load(html);
    const baseUrl = url;

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
    const completePage = this.extractCompletePage($, baseUrl);

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

    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt');
      const parentDivClass = $(el).closest('div').attr('class');
      if (src && !uniqueImageUrls.has(src)) {
        uniqueImageUrls.add(src);
        imageUrls.push({
          url: new URL(src, baseUrl).href,
          name: alt || parentDivClass || '',
        });
      }
    });

    $('meta').each((_, el) => {
      const name = $(el).attr('name') || $(el).attr('property');
      const content = $(el).attr('content');
      if (name && content) {
        metaTags[name] = content;
      }
    });

    const title = $('title').text().trim();

    Object.keys(headings).forEach((tag) => {
      $(tag).each((_, el) => {
        headings[tag].push($(el).text().trim());
      });
    });

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

    this.logger.log(`Extracted data from URL: ${url}`);

    const extractedPageData: ExtractedPageData = {
      url,
      cleanedText,
      metaTags,
      title,
      headings,
      internalLinks,
      externalLinks,
      imageUrls,
      scriptUrls,
      stylesheetUrls,
      completePage,
    };

    return extractedPageData;
  }
}

// import { Injectable, Logger } from '@nestjs/common';
// import * as cheerio from 'cheerio';
// import {
//   TaskComponentType,
//   TaskComponents,
// } from '../../../interfaces/task.interface';
// import { TaskComponent } from '../../../components-registry/components-registry.decorator';
// import {
//   ExtractedPageData,
//   LinkData,
// } from '../../../tools/crawler/strategies/crawler-strategies/crawler-strategy.interface';
// import { Page } from '../puppeteer/puppeteer.service';

// @Injectable()
// @TaskComponent(TaskComponentType.UTILITY)
// export class CheerioUtilityService implements TaskComponents {
//   name = 'CheerioUtility';
//   description = 'Parses HTML content';
//   type: TaskComponentType = TaskComponentType.UTILITY;

//   private readonly logger = new Logger(CheerioUtilityService.name);

//   /**
//    * Loads HTML and returns the CheerioStatic object for further manipulation.
//    * @param html The HTML string to be loaded.
//    */
//   load(html: string) {
//     return cheerio.load(html);
//   }

//   /**
//    * Extracts and cleans text from a CheerioStatic object.
//    * @param $ The CheerioStatic object.
//    */
//   private extractAndCleanText($: cheerio.Root): string {
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

//   /**
//    * Extracts page data from a given Puppeteer page and task details.
//    * @param page The Puppeteer page object.
//    * @param task The task object containing the URL details.
//    */
//   async extractPageData(page: Page, url: string): Promise<ExtractedPageData> {
//     const html = await page.content();
//     const $ = cheerio.load(html);
//     const baseUrl = url;

//     const getBaseDomain = (url: string) => {
//       const hostname = new URL(url).hostname;
//       const parts = hostname.split('.').reverse();
//       if (parts.length >= 2) {
//         return parts[1] + '.' + parts[0];
//       }
//       return hostname;
//     };

//     const baseDomain = getBaseDomain(baseUrl);

//     const cleanedText = this.extractAndCleanText($);

//     const uniqueInternalLinks = new Set<string>();
//     const uniqueExternalLinks = new Set<string>();
//     const internalLinks: LinkData[] = [];
//     const externalLinks: LinkData[] = [];
//     const uniqueImageUrls = new Set<string>();
//     const imageUrls: LinkData[] = [];
//     const uniqueScriptUrls = new Set<string>();
//     const scriptUrls: string[] = [];
//     const uniqueStylesheetUrls = new Set<string>();
//     const stylesheetUrls: string[] = [];
//     const metaTags: Record<string, string> = {};
//     const headings: Record<string, string[]> = {
//       H1: [],
//       H2: [],
//       H3: [],
//       H4: [],
//       H5: [],
//       H6: [],
//     };

//     // Extract internal and external links
//     $('a').each((_, el) => {
//       const href = $(el).attr('href');
//       const text = $(el).text().trim();
//       if (href) {
//         const resolvedUrl = new URL(href, baseUrl).href;
//         const resolvedDomain = getBaseDomain(resolvedUrl);

//         const linkData: LinkData = { url: resolvedUrl, name: text || href };
//         if (resolvedDomain === baseDomain) {
//           if (!uniqueInternalLinks.has(resolvedUrl)) {
//             uniqueInternalLinks.add(resolvedUrl);
//             internalLinks.push(linkData);
//           }
//         } else {
//           if (!uniqueExternalLinks.has(resolvedUrl)) {
//             uniqueExternalLinks.add(resolvedUrl);
//             externalLinks.push(linkData);
//           }
//         }
//       }
//     });

//     // Extract image URLs
//     $('img').each((_, el) => {
//       const src = $(el).attr('src');
//       const alt = $(el).attr('alt');
//       const parentDivClass = $(el).closest('div').attr('class');
//       if (src && !uniqueImageUrls.has(src)) {
//         uniqueImageUrls.add(src);
//         imageUrls.push({ url: src, name: alt || parentDivClass || '' });
//       }
//     });

//     // Extract meta tags
//     $('meta').each((_, el) => {
//       const name = $(el).attr('name') || $(el).attr('property');
//       const content = $(el).attr('content');
//       if (name && content) {
//         metaTags[name] = content;
//       }
//     });

//     // Extract title
//     const title = $('title').text().trim();

//     // Extract headings
//     Object.keys(headings).forEach((tag) => {
//       $(tag).each((_, el) => {
//         headings[tag].push($(el).text().trim());
//       });
//     });

//     // Extract script URLs
//     $('script').each((_, el) => {
//       const src = $(el).attr('src');
//       if (src) {
//         const resolvedUrl = new URL(src, baseUrl).href;
//         if (!uniqueScriptUrls.has(resolvedUrl)) {
//           uniqueScriptUrls.add(resolvedUrl);
//           scriptUrls.push(resolvedUrl);
//         }
//       }
//     });

//     // Extract stylesheet URLs
//     $('link[rel="stylesheet"]').each((_, el) => {
//       const href = $(el).attr('href');
//       if (href) {
//         const resolvedUrl = new URL(href, baseUrl).href;
//         if (!uniqueStylesheetUrls.has(resolvedUrl)) {
//           uniqueStylesheetUrls.add(resolvedUrl);
//           stylesheetUrls.push(resolvedUrl);
//         }
//       }
//     });

//     this.logger.log(`Extracted homepage data from URL`);

//     const extractedPageData: ExtractedPageData = {
//       url,
//       cleanedText,
//       metaTags,
//       title,
//       headings,
//       internalLinks,
//       externalLinks,
//       imageUrls,
//       scriptUrls,
//       stylesheetUrls,
//     };

//     return extractedPageData;
//   }
// }
