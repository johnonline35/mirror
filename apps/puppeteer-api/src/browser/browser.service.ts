import { Injectable, Logger } from '@nestjs/common';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chromium from '@sparticuz/chromium';
import { ProxyService } from '../proxy/proxy.service';
import { Browser, Page } from 'puppeteer-core';

export { Browser, Page };

@Injectable()
export class BrowserService {
  private readonly logger = new Logger(BrowserService.name);

  constructor(private readonly proxyService: ProxyService) {
    puppeteerExtra.use(StealthPlugin());
  }

  async launchBrowser(): Promise<Browser> {
    const { server } = this.proxyService.getProxyConfig();
    const browser = (await puppeteerExtra.launch({
      args: [`--proxy-server=http://${server}`, ...chromium.args],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: 'shell',
      ignoreHTTPSErrors: true,
    })) as unknown as Browser; // only way I could clear Browser return type error

    return browser;
  }

  async closeBrowser(browser: Browser): Promise<void> {
    await browser.close();
    this.logger.log('Browser closed');
  }
}
