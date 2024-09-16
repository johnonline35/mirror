import { Injectable, Logger } from '@nestjs/common';
import { BrowserService, Browser, Page } from '../browser/browser.service';
import { ProxyService } from '../proxy/proxy.service';
import { RetryService } from '../retry/retry.service';

@Injectable()
export class PuppeteerService {
  private readonly logger = new Logger(PuppeteerService.name);

  constructor(
    private readonly retryService: RetryService,
    private readonly browserService: BrowserService,
    private readonly proxyService: ProxyService,
  ) {}

  async runPuppeteer(url: string): Promise<string> {
    return this.retryService.retry(() => this.fetchPageContent(url));
  }

  private async fetchPageContent(url: string): Promise<string> {
    const browser: Browser = await this.browserService.launchBrowser();
    const page: Page = await this.setupPage(browser);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await this.scrollPage(page);

    const html = await page.content();
    await this.browserService.closeBrowser(browser);

    return html;
  }

  private async setupPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    const { credentials } = this.proxyService.getProxyConfig();
    await page.authenticate(credentials);
    return page;
  }

  private async scrollPage(page: Page): Promise<void> {
    let scrolls = 0;
    while (scrolls < 10) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await new Promise((resolve) => setTimeout(resolve, 500));
      scrolls++;
    }
  }
}

// Specialised scrollPage method with more realistic behavior - needs testing on lambda:

// private async scrollPage(page: Page): Promise<void> {
//   let scrolls = 0;
//   const maxScrolls = 8 + Math.floor(Math.random() * 5); // Random scroll count between 8 and 12
//   const sessionScrollBehavior = Math.random(); // Different behavior per session

//   while (scrolls < maxScrolls) {
//     // Randomly decide between a small or large scroll
//     const scrollHeight = sessionScrollBehavior > 0.5
//       ? window.innerHeight * (0.1 + Math.random() * 0.4) // Smaller scroll range (10% to 50% of viewport)
//       : window.innerHeight * (0.7 + Math.random() * 0.6); // Larger scroll range (70% to 130% of viewport)

//     await page.evaluate((scrollHeight) => window.scrollBy(0, scrollHeight), scrollHeight);

//     // Simulate occasional mouse movement with realistic small adjustments
//     if (Math.random() > 0.3) { // 70% chance to move the mouse
//       await this.simulateMouseMovement(page);
//     }

//     // Introduce random pauses based on session behavior
//     if (Math.random() > sessionScrollBehavior) { // Session-based pause chance
//       const pauseDuration = 1000 + Math.random() * 3000; // Pause for 1-4 seconds
//       await new Promise((resolve) => setTimeout(resolve, pauseDuration));
//     }

//     // More varied and natural delay between scrolls
//     const delay = Math.random() * Math.random() * 1000 + 200; // Between 200ms and ~2000ms
//     await new Promise((resolve) => setTimeout(resolve, delay));

//     scrolls++;
//   }
// }

// private async simulateMouseMovement(page: Page): Promise<void> {
//   const width = await page.evaluate(() => window.innerWidth);
//   const height = await page.evaluate(() => window.innerHeight);

//   // Move the mouse to a random position on the screen
//   const mouseX = Math.floor(Math.random() * width);
//   const mouseY = Math.floor(Math.random() * height);
//   await page.mouse.move(mouseX, mouseY, { steps: 5 + Math.floor(Math.random() * 10) }); // Random steps between 5 and 15

//   // Simulating small, human-like adjustments after initial move
//   if (Math.random() > 0.5) { // 50% chance to make small adjustments
//     const smallMoveX = mouseX + (Math.random() - 0.5) * 10; // Small adjustment
//     const smallMoveY = mouseY + (Math.random() - 0.5) * 10;
//     await page.mouse.move(smallMoveX, smallMoveY, { steps: 3 + Math.floor(Math.random() * 7) }); // Small movements
//   }
// }
