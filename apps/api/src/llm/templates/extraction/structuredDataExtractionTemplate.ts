import { BaseTemplate } from '../../templates/baseTemplate';

// Template versions
const STRUCTURED_DATA_EXTRACTION_TEMPLATE_V2 = `
todo
`;

const STRUCTURED_DATA_EXTRACTION_TEMPLATE_V1 = `
You are a highly advanced data extraction agent tasked with reviewing and extracting data and insights from the raw page data you have been given. Using this given data, your goal is to extract the data the user has asked for and output it in the schema format the user has given: {{{task.details.schema}}}

Original Goal:
- This was the original goal for the initial plan: 
User goal: {{{task.details.prompt}}}
Base URL: {{{task.details.url}}}
This is the schema format the user has asked for the data to be returned in: {{{task.details.schema}}}

Raw Page Data:
This is the raw data that has been extracted and cleaned is ready for you to analyse to find the data:

- Plain Text: 
{{pageData.completePage}}

- External Links:
{{#if pageData.externalLinks}}
{{#each pageData.externalLinks}}
  - Link Name: {{name}}, URL: {{url}}
{{/each}}
{{else}}N/A
{{/if}}

Structured Data Extraction:
1. Assess whether the data the user is looking for can be found, or classified from the raw page data you have been given.
2. If it can be, then follow the guidleiness for expected output.
3. If it cannot be, then write null for that field in the expected output.

Expected Output:
- Retrieve / or transform / or classify the data that you have been given such that you have over 80% confidence that you can complete the users goal: {{{task.details.prompt}}} and output into this schema:
{{{task.details.schema}}}
`;

export {
  STRUCTURED_DATA_EXTRACTION_TEMPLATE_V1,
  STRUCTURED_DATA_EXTRACTION_TEMPLATE_V2,
};

// Version constants
const VERSION_MAP = {
  '1.0': STRUCTURED_DATA_EXTRACTION_TEMPLATE_V1,
  '2.0': STRUCTURED_DATA_EXTRACTION_TEMPLATE_V2,
};

// Template class
export class StructuredDataExtractionTemplate extends BaseTemplate {
  constructor(version: string = '1.0') {
    const template = VERSION_MAP[version];
    if (!template) {
      throw new Error(`Template version ${version} not found`);
    }
    super(template, version);
  }

  static create(version: string = '1.0') {
    return new StructuredDataExtractionTemplate(version);
  }
}