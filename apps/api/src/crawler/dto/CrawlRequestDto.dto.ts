import { IsInt, IsString } from 'class-validator';

export class CrawlRequestDto {
  @IsString({ message: 'URL must be a string' })
  url: string;

  @IsInt({ message: 'Max depth must be an integer' })
  maxDepth: number;

  @IsString({ message: 'Prompt must be a string' })
  prompt?: string;

  /**
   * Constructor to initialize the CrawlRequestDto with a URL and maximum depth.
   * @param url The URL to crawl.
   * @param maxDepth The maximum depth to crawl. Defaults to a depth of 0 if not specified.
   * @param prompt The prompt for the LLM.
   */
  constructor(url: string, maxDepth: number = 0, prompt?: string) {
    this.url = url;
    this.maxDepth = maxDepth;
    this.prompt = prompt;
  }
}
