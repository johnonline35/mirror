import { Module } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
import { RetryModule } from '../retry/retry.module';
import { ProxyModule } from '../proxy/proxy.module';
import { BrowserModule } from '../browser/browser.module';

@Module({
  imports: [RetryModule, ProxyModule, BrowserModule],
  providers: [PuppeteerService],
})
export class PuppeteerModule {}
