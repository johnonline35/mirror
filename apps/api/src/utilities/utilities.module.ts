import { Global, Module } from '@nestjs/common';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import { CheerioService } from './cheerio/cheerio.service';
import { GoogleSearchService } from './googlesearch/googlesearch.service';

@Global()
@Module({
  providers: [PuppeteerService, CheerioService, GoogleSearchService],
  exports: [PuppeteerService, CheerioService, GoogleSearchService],
})
export class UtilitiesModule {}
