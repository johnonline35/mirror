import { BaseTemplate } from '../baseTemplate';

// Template versions
const HOMEPAGE_SUMMARIZATION_TEMPLATE_V1 = `
  [
    {
      "role": "system",
      "content": "You are a helpful assistant that is able to understand the context of words on a web page and describe in simple sentences what each part of the text on a page is meant to do. Also describe the core features of the business that the page represents - how does it likely make money?"
    },
    {
      "role": "user",
      "content": "Please summarize the following content to make it readable and meaningful, removing redundant or unhelpful words: {{text}}"
    }
  ]
`;

const HOMEPAGE_SUMMARIZATION_TEMPLATE_V2 = `
  [
    {
      "role": "system",
      "content": "You are a helpful assistant that is able to understand the context of a web page and provide a concise summary of its content. Additionally, highlight the core business features and revenue model."
    },
    {
      "role": "user",
      "content": "Please summarize the following content in a concise and meaningful way: {{text}}"
    }
  ]
`;

// Version constants
const VERSIONS = {
  HOMEPAGE_SUMMARIZATION: '1.0',
  HOMEPAGE_SUMMARIZATION_V2: '2.0',
};

// Template registry
const TEMPLATE_REGISTRY = {
  [VERSIONS.HOMEPAGE_SUMMARIZATION]: HOMEPAGE_SUMMARIZATION_TEMPLATE_V1,
  [VERSIONS.HOMEPAGE_SUMMARIZATION_V2]: HOMEPAGE_SUMMARIZATION_TEMPLATE_V2,
};

// Template class
export class HomePageSummarizationTemplate extends BaseTemplate {
  constructor(version: string = VERSIONS.HOMEPAGE_SUMMARIZATION) {
    const template = TEMPLATE_REGISTRY[version];
    if (!template) {
      throw new Error(`Template version ${version} not found`);
    }
    super(template, version);
  }

  static create(version: string = VERSIONS.HOMEPAGE_SUMMARIZATION) {
    return new HomePageSummarizationTemplate(version);
  }
}
