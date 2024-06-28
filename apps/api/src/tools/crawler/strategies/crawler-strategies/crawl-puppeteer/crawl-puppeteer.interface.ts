export interface LinkData {
  url: string;
  name: string;
}

export interface ExtractedHomePageData {
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
