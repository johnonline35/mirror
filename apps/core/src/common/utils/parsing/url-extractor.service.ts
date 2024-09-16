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
      const parsedUrl = new URL(url);
      // Check if the URL has a valid hostname
      return parsedUrl.hostname.includes('.');
    } catch (e) {
      this.logger.warn(`Invalid URL detected: ${url}`, e);
      return false;
    }
  }

  extractDomainName(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;

      // Check for IP address (IPv4)
      if (hostname.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
        return hostname;
      }

      // Check for IP address (IPv6)
      if (hostname.match(/^\[[0-9a-fA-F:]+\]$/)) {
        return hostname;
      }

      const domainParts = hostname.split('.');

      // Handle Punycode (IDNs)
      const decodedHostname = hostname.startsWith('xn--')
        ? decodeURIComponent(hostname)
        : hostname;

      if (domainParts.length > 2) {
        // Handle subdomains by getting the last two parts of the hostname
        return domainParts.slice(-2).join('.');
      } else {
        return decodedHostname;
      }
    } catch (error) {
      console.error('Invalid URL', error);
      return '';
    }
  }
}
