import { BaseTemplate } from '../baseTemplate';

// Template versions
const STRUCTURED_REVIEWED_DATA_TEMPLATE_V2 = `
You are an advanced data analysis specialist responsible for reviewing, deduplicating, and finalizing the data provided.

### Original Task
- **User Goal:** {{{task.details.prompt}}}
- **Target Schema:** {{{task.details.schema}}}

### Data for Analysis
Below is the extracted data that has already been turned into json from individual pages. Your task is to deduplicate, condense, and structure this data into a single JSON object that aligns with the user's request.

#### JSON for each page
{{#if processedPagesData}}
  {{#each processedPagesData}}
    - **Page URL:** {{{this.url}}}
    - **Page JSON:** {{{this.extractedPageDataJson}}}
  {{/each}}
{{else}}N/A
{{/if}}

### Structured Data Review Guidelines
1. **Identify and Classify:** Determine if the relevant data needed to fulfill the user's goal is present in the provided data.
2. **Deduplicate:** Remove any redundant information to avoid repetition.
3. **No Inference:** Do not infer or create new information; only summarize or classify what is explicitly present.
4. **Condense:** Where data is repetitive, summarize it to ensure the final output is concise and non-redundant.
5. **Strict Key Preservation:** **Do not** change, rename, or alter any key names in the final output. **All key names** must exactly match the ones provided in the {{{task.details.schema}}}.

### Expected Output
- Your final output should be a single JSON object that satisfies the user's goal, adhering strictly to the requested schema.
`;

const STRUCTURED_REVIEWED_DATA_TEMPLATE_V1 = `
You are an advanced data analysis specialist responsible for reviewing, deduplicating, and finalizing the data provided.

### Original Task
- **User Goal:** {{{task.details.prompt}}}
- **Base URL:** {{{task.details.url}}}
- **Target Schema:** {{{task.details.schema}}}

### Data for Analysis
Below is the extracted and summarized data from individual pages. Your task is to deduplicate, condense, and structure this data into a single JSON object that aligns with the user's request.

#### Raw Page Data
{{#if processedPagesData}}
  {{#each processedPagesData}}
    - **Page URL:** {{{this.individualPageDataObject.url}}}
    - **Page Data:** {{{this.extractedPageData}}}
  {{/each}}
{{else}}N/A
{{/if}}

### Structured Data Review Guidelines
1. **Identify and Classify:** Determine if the relevant data needed to fulfill the user's goal is present in the provided data.
2. **Deduplicate:** Remove any redundant information to avoid repetition.
3. **No Inference:** Do not infer or create new information; only summarize or classify what is explicitly present.
4. **Condense:** Where data is repetitive, summarize it to ensure the final output is concise and non-redundant.

### Expected Output
- Your final output should be a single JSON object that satisfies the user's goal with over 80% confidence, adhering strictly to the target schema: {{{task.details.schema}}}.
- **Key names in the output must match exactly with the ones provided in the target schema.**
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
