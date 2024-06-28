import { Global, Module } from '@nestjs/common';
import { PuppeteerUtilityService } from './puppeteer/puppeteer.service';
import { CheerioUtilityService } from './cheerio/cheerio.service';
import { GoogleSearchUtilityService } from './googlesearch/googlesearch.service';
import { ParsePromptService } from './parsing/parse-prompt.service';
import { UrlExtractorService } from './parsing/url-extractor.service';

@Global()
@Module({
  providers: [
    PuppeteerUtilityService,
    CheerioUtilityService,
    GoogleSearchUtilityService,
    ParsePromptService,
    UrlExtractorService,
  ],
  exports: [
    PuppeteerUtilityService,
    CheerioUtilityService,
    GoogleSearchUtilityService,
    ParsePromptService,
    UrlExtractorService,
  ],
})
export class UtilitiesModule {}
