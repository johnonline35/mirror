// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import puppeteer from 'puppeteer-extra';
// import { Browser, Page } from 'puppeteer';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// import {
//   TaskComponentType,
//   TaskComponents,
// } from '../../../interfaces/task.interface';
// import { TaskComponent } from '../../../components-registry/components-registry.decorator';

// export { Browser, Page };

// puppeteer.use(StealthPlugin());

// @Injectable()
// @TaskComponent(TaskComponentType.UTILITY)
// export class PuppeteerUtilityService implements TaskComponents {
//   name = 'PuppeteerUtility';
//   description = 'Controls headless Chrome for web scraping';
//   type: TaskComponentType = TaskComponentType.UTILITY;

//   constructor(private configService: ConfigService) {}

//   private userAgentList: string[] = [
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 Edg/91.0.864.54',
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
//     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
//     'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
//     'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
//     'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/89.0',
//     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/89.0',
//     'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36',
//   ];

//   private getRandomUserAgent(): string {
//     const randomIndex = Math.floor(Math.random() * this.userAgentList.length);
//     return this.userAgentList[randomIndex];
//   }

//   async launchBrowser(): Promise<Browser> {
//     const proxyServer = this.configService.get<string>('SMARTPROXY_SERVER');
//     console.log('proxyServer:', proxyServer);
//     const browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         `--proxy-server=http://${proxyServer}`,
//       ],
//     });
//     return browser;
//   }

//   async createPage(browser: Browser): Promise<Page> {
//     try {
//       const page = await browser.newPage();

//       // Set authentication credentials for Smartproxy
//       const username = process.env.SMARTPROXY_USERNAME;
//       const password = process.env.SMARTPROXY_PASSWORD;
//       console.log('username', username);

//       if (!username || !password) {
//         throw new Error(
//           'Smartproxy credentials are not set in environment variables',
//         );
//       }

//       await page.authenticate({
//         username: username,
//         password: password,
//       });

//       // Set random user agent
//       // await page.setUserAgent(this.getRandomUserAgent());

//       console.log(
//         'Successfully created and authenticated a new page with Smartproxy',
//       );
//       return page;
//     } catch (error) {
//       console.error(
//         'Failed to create or authenticate page with Smartproxy',
//         error.stack,
//       );
//       throw new Error('Failed to create or authenticate page with Smartproxy');
//     }
//   }

//   async extractHtmlFromPage(url: string, page: Page): Promise<string> {
//     console.log('Trying to extractHtmlFromPage...');
//     await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
//     return page.content();
//   }

//   async performTwoScrolls(
//     page: Page,
//     numberOfScrolls: number = 2,
//   ): Promise<void> {
//     console.log('Scrolling...');
//     for (let i = 0; i < numberOfScrolls; i++) {
//       await page.evaluate(() => window.scrollBy(0, window.innerHeight));
//       await page.waitForNetworkIdle();
//     }
//   }
// }

// // import { Injectable } from '@nestjs/common';
// // import { ConfigService } from '@nestjs/config';
// // import puppeteer from 'puppeteer-extra';
// // import { Browser, Page } from 'puppeteer';
// // import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// // import {
// //   TaskComponentType,
// //   TaskComponents,
// // } from '../../../interfaces/task.interface';
// // import { TaskComponent } from '../../../components-registry/components-registry.decorator';

// // export { Browser, Page };

// // puppeteer.use(StealthPlugin());

// // @Injectable()
// // @TaskComponent(TaskComponentType.UTILITY)
// // export class PuppeteerUtilityService implements TaskComponents {
// //   name = 'PuppeteerUtility';
// //   description = 'Controls headless Chrome for web scraping';
// //   type: TaskComponentType = TaskComponentType.UTILITY;

// //   constructor(private configService: ConfigService) {}

// //   private userAgentList: string[] = [
// //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
// //     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
// //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 Edg/91.0.864.54',
// //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
// //     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
// //     'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
// //     'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
// //     'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
// //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/89.0',
// //     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/89.0',
// //     'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36',
// //   ];

// //   private getRandomUserAgent(): string {
// //     const randomIndex = Math.floor(Math.random() * this.userAgentList.length);
// //     return this.userAgentList[randomIndex];
// //   }

// //   async launchBrowser(): Promise<Browser> {
// //     const proxyServer = this.configService.get<string>('SMARTPROXY_SERVER');
// //     console.log('proxyServer:', proxyServer);
// //     const browser = await puppeteer.launch({
// //       headless: true,
// //       args: [
// //         '--no-sandbox',
// //         '--disable-setuid-sandbox',
// //         `--proxy-server=http://${proxyServer}`,
// //       ],
// //     });
// //     return browser;
// //   }

// //   async createPage(browser: Browser): Promise<Page> {
// //     try {
// //       const page = await browser.newPage();

// //       // Set authentication credentials for Smartproxy
// //       const username = process.env.SMARTPROXY_USERNAME;
// //       const password = process.env.SMARTPROXY_PASSWORD;
// //       console.log('username', username);

// //       if (!username || !password) {
// //         throw new Error(
// //           'Smartproxy credentials are not set in environment variables',
// //         );
// //       }

// //       await page.authenticate({
// //         username: username,
// //         password: password,
// //       });

// //       // Set random user agent
// //       // await page.setUserAgent(this.getRandomUserAgent());

// //       console.log(
// //         'Successfully created and authenticated a new page with Smartproxy',
// //       );
// //       return page;
// //     } catch (error) {
// //       console.error(
// //         'Failed to create or authenticate page with Smartproxy',
// //         error.stack,
// //       );
// //       throw new Error('Failed to create or authenticate page with Smartproxy');
// //     }
// //   }

// //   async extractHtmlFromPage(url: string, page: Page): Promise<string> {
// //     console.log('Trying to extractHtmlFromPage...');
// //     await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
// //     return page.content();
// //   }

// //   async performTwoScrolls(
// //     page: Page,
// //     numberOfScrolls: number = 2,
// //   ): Promise<void> {
// //     console.log('Scrolling...');
// //     for (let i = 0; i < numberOfScrolls; i++) {
// //       await page.evaluate(() => window.scrollBy(0, window.innerHeight));
// //       await page.waitForNetworkIdle();
// //     }
// //   }
// // }

// // import { Injectable } from '@nestjs/common';
// // import { ConfigService } from '@nestjs/config';
// // import * as puppeteer from 'puppeteer';
// // import { Browser, Page } from 'puppeteer';
// // import {
// //   TaskComponentType,
// //   TaskComponents,
// // } from '../../../interfaces/task.interface';
// // import { TaskComponent } from '../../../components-registry/components-registry.decorator';

// // export { Browser, Page };

// // @Injectable()
// // @TaskComponent(TaskComponentType.UTILITY)
// // export class PuppeteerUtilityService implements TaskComponents {
// //   name = 'PuppeteerUtility';
// //   description = 'Controls headless Chrome for web scraping';
// //   type: TaskComponentType = TaskComponentType.UTILITY;

// //   constructor(private configService: ConfigService) {}

// //   async launchBrowser(): Promise<Browser> {
// //     const proxyServer = this.configService.get<string>('SMARTPROXY_SERVER');
// //     console.log('proxyServer:', proxyServer);
// //     const browser = await puppeteer.launch({
// //       headless: 'new',
// //       args: [
// //         '--no-sandbox',
// //         '--disable-setuid-sandbox',
// //         `--proxy-server=http://${proxyServer}`,
// //       ],
// //     });
// //     return browser;
// //   }

// //   async createPage(browser: Browser): Promise<Page> {
// //     try {
// //       const page = await browser.newPage();

// //       // Set authentication credentials for Smartproxy
// //       const username = process.env.SMARTPROXY_USERNAME;
// //       const password = process.env.SMARTPROXY_PASSWORD;
// //       console.log('username', username);

// //       if (!username || !password) {
// //         throw new Error(
// //           'Smartproxy credentials are not set in environment variables',
// //         );
// //       }

// //       await page.authenticate({
// //         username: username,
// //         password: password,
// //       });

// //       console.log(
// //         'Successfully created and authenticated a new page with Smartproxy',
// //       );
// //       return page;
// //     } catch (error) {
// //       console.error(
// //         'Failed to create or authenticate page with Smartproxy',
// //         error.stack,
// //       );
// //       throw new Error('Failed to create or authenticate page with Smartproxy');
// //     }
// //   }

// //   async extractHtmlFromPage(url: string, page: Page): Promise<string> {
// //     console.log('Trying to extractHtmlFromPage...');
// //     await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
// //     return page.content();
// //   }

// //   async performTwoScrolls(
// //     page: Page,
// //     numberOfScrolls: number = 2,
// //   ): Promise<void> {
// //     console.log('Scrolling...');
// //     for (let i = 0; i < numberOfScrolls; i++) {
// //       await page.evaluate(() => window.scrollBy(0, window.innerHeight));
// //       await page.waitForNetworkIdle();
// //     }
// //   }
// // }
