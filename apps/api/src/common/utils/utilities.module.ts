import { Global, Module } from '@nestjs/common';
import { PuppeteerUtilityService } from './puppeteer/puppeteer.service';
import { CheerioUtilityService } from './cheerio/cheerio.service';
import { GoogleSearchUtilityService } from './googlesearch/googlesearch.service';
import { ParsePromptService } from './parsing/parse-prompt.service';

@Global()
@Module({
  providers: [
    PuppeteerUtilityService,
    CheerioUtilityService,
    GoogleSearchUtilityService,
    ParsePromptService,
  ],
  exports: [
    PuppeteerUtilityService,
    CheerioUtilityService,
    GoogleSearchUtilityService,
    ParsePromptService,
  ],
})
export class UtilitiesModule {}
