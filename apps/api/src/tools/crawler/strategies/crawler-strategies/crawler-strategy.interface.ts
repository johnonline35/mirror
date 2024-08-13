import { ITask } from '../../../../interfaces/task.interface';

export interface ICrawlerStrategy {
  execute(task: ITask, url: string): Promise<string>;
}

export interface LinkData {
  url: string;
  name: string;
}

export interface ExtractedPageData {
  url: string;
  cleanedText: string;
  completePage: string;
  internalLinks?: LinkData[];
  externalLinks?: LinkData[];
  imageUrls?: LinkData[];
  metaTags?: Record<string, string>;
  title?: string;
  headings?: Record<string, string[]>;
  scriptUrls?: string[];
  stylesheetUrls?: string[];
}

export interface ProcessedPagesData {
  url: string;
  extractedPageData: ExtractedPageData;
  processedData: string;
}

export interface ExtractedAndProcessedData {
  extractedPageData: ExtractedPageData[];
  processedData: string;
}
