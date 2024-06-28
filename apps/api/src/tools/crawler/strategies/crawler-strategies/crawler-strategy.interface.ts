import { ITask } from '../../../../interfaces/task.interface';

export interface ICrawlerStrategy {
  execute(task: ITask): Promise<any>;
}

export interface LinkData {
  url: string;
  name: string;
}

export interface ExtractedPageData {
  cleanedText: string;
  // extractedHomePageText: string;
  internalLinks?: LinkData[];
  externalLinks?: LinkData[];
  imageUrls?: LinkData[];
  metaTags?: Record<string, string>;
  title?: string;
  headings?: Record<string, string[]>;
  scriptUrls?: string[];
  stylesheetUrls?: string[];
}
