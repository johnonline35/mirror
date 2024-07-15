import { BaseTemplate } from '../baseTemplate';

// Template versions
const STRUCTURED_REVIEWED_DATA_TEMPLATE_V2 = `
You are a highly advanced data analysis agent tasked with reviewing, deduplicating and writing the final object for data you have been given. Using this given data, your goal is to extract the data the user has asked for and output it in the schema format the user has given: {{{task.details.schema}}}

Original Goal:
- This was the original goal for the initial plan: 
User goal: {{{task.details.prompt}}}
Base URL: {{{task.details.url}}}
This is the schema format the user has asked for the data to be returned in: {{{task.details.schema}}}

Data to analyse:
This is the data that has been extracted and summzarized from each individual page, and is now ready for you to analyse. Please ensure the final json object you write has condensed the data and deduplicated it. The goal is to output a single json object that meets the users request from the data you've been given:

Raw Page Data:
{{#if extractedPagesData}}
  {{#each extractedPagesData}}
    Page URL: {{{this.url}}}
    Page Data: {{{this.cleanedText}}}
  {{/each}}
{{else}}N/A
{{/if}}


Structured Data Review:
1. Assess whether the data the user is looking for can be found or classified from the data you have been given.
2. Deduplicate this data.
3. Do not infer anything, be sure only to summarize or classify data, do not infer or create anything hypothetically.
4. Condense the data when appropriate. If the data is directly or indirectly repeitive in some places, then summarize and condense it so that the data you output is not repeating itself anywhere.

Expected Output:
- Retrieve / or transform / or classify the data that you have been given such that you have over 80% confidence that you can complete the users goal: {{{task.details.prompt}}} and output into this schema:
{{{task.details.schema}}}
`;

const STRUCTURED_REVIEWED_DATA_TEMPLATE_V1 = `
You are a highly advanced data analysis agent tasked with reviewing, deduplicating and writing the final object for data you have been given. Using this given data, your goal is to extract the data the user has asked for and output it in the schema format the user has given: {{{task.details.schema}}}

Original Goal:
- This was the original goal for the initial plan: 
User goal: {{{task.details.prompt}}}
Base URL: {{{task.details.url}}}
This is the schema format the user has asked for the data to be returned in: {{{task.details.schema}}}

Data to analyse:
This is the data that has been extracted and summzarized from each individual page, and is now ready for you to analyse. Please ensure the final json object you write has condensed the data and deduplicated it. The goal is to clean these json objects up and output a single json object that meets the users request from the data you've been given:

Processed Data:
{{#if processedPagesData}}
  {{#each processedPagesData}}
    URL: {{{this.url}}}
    Processed Data: {{{this.jsonifiedData}}}
  {{/each}}
{{else}}N/A
{{/if}}


Structured Data Review:
1. Assess whether the data the user is looking for can be found or classified from the data you have been given. Do not infer any data that is missing. If data is not there then write null.
2. Deduplicate this data.
3. Condense the data when appropriate. If the data is directly or indirectly repeitive in some places, then summarize and condense it so that the data you output is not repeating itself anywhere.

Expected Output:
- Retrieve / or transform / or classify the data that you have been given such that you have over 80% confidence that you can complete the users goal: {{{task.details.prompt}}} and output into this schema:
{{{task.details.schema}}}
`;

export {
  STRUCTURED_REVIEWED_DATA_TEMPLATE_V1,
  STRUCTURED_REVIEWED_DATA_TEMPLATE_V2,
};

// Version constants
const VERSION_MAP = {
  '1.0': STRUCTURED_REVIEWED_DATA_TEMPLATE_V1,
  '2.0': STRUCTURED_REVIEWED_DATA_TEMPLATE_V2,
};

// Template class
export class StructuredReviewedDataTemplate extends BaseTemplate {
  constructor(version: string = '1.0') {
    const template = VERSION_MAP[version];
    if (!template) {
      throw new Error(`Template version ${version} not found`);
    }
    super(template, version);
  }

  static create(version: string = '1.0') {
    return new StructuredReviewedDataTemplate(version);
  }
}
