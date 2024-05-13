import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { CreateDataPreprocessorDto } from './dto/create-data-preprocessor.dto';

@Injectable()
export class DataPreprocessorService {
  constructor() {}

  cleanHtml(htmlContent: string, dto: CreateDataPreprocessorDto): string {
    const $ = cheerio.load(htmlContent);

    if (dto.removeScripts) {
      $('script').remove();
    }

    if (dto.removeLinks) {
      $('link[rel="stylesheet"]').remove();
    }

    if (dto.removeStyles) {
      $('style').remove();
      $('link[rel="stylesheet"]').remove(); // Remove all linked stylesheets
      $('*').removeAttr('style'); // Remove all inline styles
    }

    // Remove SVG elements if they are part of styling
    $('svg').remove();
    $('path').remove(); // Removes <path> elements, often part of SVG icons

    // Optionally remove other non-content noise
    $('meta')
      .filter((i, el) => {
        // Remove meta tags not critical for content rendering
        const metaName = $(el).attr('name');
        return !['description', 'keywords'].includes(metaName);
      })
      .remove();

    return $.html();
  }
}
