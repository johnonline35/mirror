import { BaseTemplate } from '../baseTemplate';

// Template versions
const CATEGORY_CLASSIFICATION_TEMPLATE_V1 = `
[
  {
    "role": "system",
    "content": "You are a helpful assistant designed to output a single word."
  },
  {
    "role": "user",
    "content": \`
Review the following summary from a homepage. Then select from these words and return only the word wrapped in quotes like this: 'word' with no other information or commentary.

"Based on the description of the website provided, return the single word 'ecommerce' if the website is classified as an ecommerce platform."

"Based on the description of the website provided, return the single word 'saas' if the website is classified as a Software as a Service (SaaS) platform."

"Based on the description of the website provided, return the single word 'content' if the website is classified as a news, blog or other type of content platform."

"Based on the description of the website provided, return the single word 'fallback' if the website does not fit into any of the other categories."

Here is the content from the homepage as a summary:
<Content>
{{summary}}
</Content>
    \`
  }
]
`;

const CATEGORY_CLASSIFICATION_TEMPLATE_V2 = `
  [
    {
      "role": "system",
      "content": "You are a helpful assistant designed to classify website types with enhanced accuracy."
    },
    {
      "role": "user",
      "content": "Classify the following website summary into one of the following categories: 'ecommerce', 'saas', 'content', 'fallback'. Here is the summary: {{summary}}"
    }
  ]
`;

// Version constants
const VERSIONS = {
  CATEGORY_CLASSIFICATION: '1.0',
  CATEGORY_CLASSIFICATION_V2: '2.0',
};

// Template registry
const TEMPLATE_REGISTRY = {
  [VERSIONS.CATEGORY_CLASSIFICATION]: CATEGORY_CLASSIFICATION_TEMPLATE_V1,
  [VERSIONS.CATEGORY_CLASSIFICATION_V2]: CATEGORY_CLASSIFICATION_TEMPLATE_V2,
};

// Template class
export class CategoryClassificationTemplate extends BaseTemplate {
  constructor(version: string = VERSIONS.CATEGORY_CLASSIFICATION) {
    const template = TEMPLATE_REGISTRY[version];
    if (!template) {
      throw new Error(`Template version ${version} not found`);
    }
    super(template, version);
  }

  static create(version: string = VERSIONS.CATEGORY_CLASSIFICATION) {
    return new CategoryClassificationTemplate(version);
  }
}
