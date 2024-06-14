import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import {
  TaskComponentType,
  TaskComponents,
} from '../../../interfaces/task.interface';
import { TaskComponent } from '../../../components-registry/components-registry.decorator';

export { Browser, Page };

@Injectable({ scope: Scope.REQUEST })
@TaskComponent(TaskComponentType.UTILITY)
export class PuppeteerUtilityService implements TaskComponents {
  name = 'PuppeteerUtility';
  description = 'Controls headless Chrome for web scraping';
  type: TaskComponentType = TaskComponentType.UTILITY;

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