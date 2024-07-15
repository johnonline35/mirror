import { Global, Module } from '@nestjs/common';
import { PuppeteerUtilityService } from './puppeteer/puppeteer.service';
import { CheerioUtilityService } from './cheerio/cheerio.service';
import { GoogleSearchUtilityService } from './googlesearch/google-search.service';
import { ParsePromptService } from './parsing/parse-prompt.service';
import { UrlExtractorService } from './parsing/url-extractor.service';
import { ConcurrentPageDataService } from './concurrency/concurrency-handler.service';
import { JsonToCsvService } from './json-to-csv/json-to-csv.service';
import { JsonExtractionService } from './json-extraction-from-text/json-extraction.service';

@Global()
@Module({
  providers: [
    PuppeteerUtilityService,
    CheerioUtilityService,
    GoogleSearchUtilityService,
    ParsePromptService,
    UrlExtractorService,
    ConcurrentPageDataService,
    JsonToCsvService,
    JsonExtractionService,
  ],
  exports: [
    PuppeteerUtilityService,
    CheerioUtilityService,
    GoogleSearchUtilityService,
    ParsePromptService,
    UrlExtractorService,
    ConcurrentPageDataService,
    JsonToCsvService,
    JsonExtractionService,
  ],
})
export class UtilitiesModule {}
