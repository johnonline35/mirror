import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';

export { Browser, Page };

@Injectable()
export class PuppeteerService {
  constructor(private configService: ConfigService) {}

  async launchBrowser(): Promise<Browser> {
    const proxyServer = this.configService.get<string>('SMARTPROXY_SERVER');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--proxy-server=http://${proxyServer}`,
      ],
    });
    return browser;
  }

  async createPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    await page.authenticate({
      username: process.env.SMARTPROXY_USERNAME,
      password: process.env.SMARTPROXY_PASSWORD,
    });
    return page;
  }

  async extractHtmlFromPage(url: string, page: Page): Promise<string> {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    return page.content();
  }

  async performTwoScrolls(
    page: Page,
    numberOfScrolls: number = 2,
  ): Promise<void> {
    for (let i = 0; i < numberOfScrolls; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForNetworkIdle();
    }
  }
}
