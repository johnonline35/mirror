import { BaseTemplate } from '../baseTemplate';

const TEMPLATE = `
  [
    {
      "role": "system",
      "content": "You are a helpful assistant designed to classify website types."
    },
    {
      "role": "user",
      "content": "Classify the following website summary into one of the following categories: 'ecommerce', 'saas', 'content', 'fallback'. Here is the summary: {{summary}}"
    }
  ]
`;

export class CategoryClassificationTemplate extends BaseTemplate {
  constructor(version: string = '1.0') {
    super(TEMPLATE, version);
  }
}
