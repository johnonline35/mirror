import { Global, Module } from '@nestjs/common';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import { CheerioUtilityService } from './cheerio/cheerio.service';
import { GoogleSearchUtilityService } from './googlesearch/googlesearch.service';

@Global()
@Module({
  providers: [
    PuppeteerService,
    CheerioUtilityService,
    GoogleSearchUtilityService,
  ],
  exports: [
    PuppeteerService,
    CheerioUtilityService,
    GoogleSearchUtilityService,
  ],
})
export class UtilitiesModule {}
