import { Global, Module } from '@nestjs/common';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import { CheerioService } from './cheerio/cheerio.service';

@Global()
@Module({
  providers: [PuppeteerService, CheerioService],
  exports: [PuppeteerService, CheerioService],
})
export class UtilitiesModule {}
