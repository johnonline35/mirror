import { Browser } from '../../utilities/puppeteer/puppeteer.service';

export type CrawlerStrategy = {
  executeStrategy: (
    url: string,
    browser: Browser,
    maxDepth: number,
    currentDepth?: number,
  ) => Promise<any>;
  crawlUrl: (crawlRequestDto: any, maxDepth: number) => Promise<any>;
};
