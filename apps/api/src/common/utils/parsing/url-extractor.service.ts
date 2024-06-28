import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UrlExtractorService {
  private readonly logger = new Logger(UrlExtractorService.name);

  extractUrls(text: any): string[] {
    try {
      // Ensure text is a string
      if (typeof text !== 'string') {
        text = String(text);
      }

      // Extract all URLs from the text using regex
      const urlRegex = /https?:\/\/[^\s"]+/g;
      const urls = text.match(urlRegex) || [];

      // Validate each URL, filter out invalid ones, and remove duplicates
      const validUrls = Array.from(
        new Set(urls.filter((url: string) => this.isValidUrl(url))),
      ) as string[];
      return validUrls;
    } catch (error) {
      this.logger.error('Failed to extract URLs', error);
      return [];
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
}
