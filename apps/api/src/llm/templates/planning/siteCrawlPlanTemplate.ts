import { BaseTemplate } from '../baseTemplate';

// Template versions
const CRAWL_PLAN_TEMPLATE_V2 = `
You are an advanced web crawler agent tasked with analyzing and navigating a website. Given the extracted data from the homepage, you need to decide the next actions and build a detailed plan to continue crawling the website effectively to achieve the goal. Use the information provided to guide your decisions and output a list of internal links to visit to achieve the goal. 

Goal:
- This overall goal you are trying to achieve - please keep this goal in mind when creating your plan. Here is the goal: {{{task.goal}}}

Extracted Data:

- Internal Links:
{{#if additionalData.internalLinks}}
{{#each additionalData.internalLinks}}
  - Name: {{name}}, URL: {{url}}
{{/each}}
{{else}}N/A
{{/if}}

Plan:
1. Identify Primary Sections: Based on the available links, identify the primary sections of the website that are most likely to contain the data you are looking for to meet the goal.
2. Remember that sections like blogs should be visited as they often contain important information, but only list the url of the main blog itself once, do not list multiple blog posts.
3. Resource Management: Ensure efficient use of resources by only listing the same url once, do not list more than once.

Next Steps:
- Return an array of Internal Links to visit that might contain the data to achieve the goal.

Expected Output:
- A list of Internal Links as strings:
  - https://www.example1.com
  - https://www.example2.com
  - https://www.example3.com
`;

const CRAWL_PLAN_TEMPLATE_V1 = `
You are an advanced web crawler agent tasked with analyzing and navigating a website. Given the extracted data from the homepage, you need to decide the next actions and build a detailed plan to continue crawling the website effectively to achieve the goal. Use the information provided to guide your decisions and output a list of internal links to visit to achieve the goal. 

Goal:
- This overall goal you are trying to achieve - please keep this goal in mind when creating your plan. Here is the goal: {{{task.goal}}}

Extracted Data:
- Cleaned Text: {{#if additionalData.cleanedText}}{{{additionalData.cleanedText}}}{{else}}N/A{{/if}}
- Meta Tags: {{#if additionalData.metaTags}}{{{json additionalData.metaTags}}}{{else}}N/A{{/if}}
- Title: {{#if additionalData.title}}{{{additionalData.title}}}{{else}}N/A{{/if}}
- Headings: {{#if additionalData.headings}}{{{json additionalData.headings}}}{{else}}N/A{{/if}}
- Internal Links: {{#if additionalData.internalLinks}}{{{json additionalData.internalLinks}}}{{else}}N/A{{/if}}
- External Links: {{#if additionalData.externalLinks}}{{{json additionalData.externalLinks}}}{{else}}N/A{{/if}}
- Image URLs: {{#if additionalData.imageUrls}}{{{json additionalData.imageUrls}}}{{else}}N/A{{/if}}
- Script URLs: {{#if additionalData.scriptUrls}}{{{json additionalData.scriptUrls}}}{{else}}N/A{{/if}}
- Stylesheet URLs: {{#if additionalData.stylesheetUrls}}{{{json additionalData.stylesheetUrls}}}{{else}}N/A{{/if}}

Plan:
1. **Identify Primary Sections**: Based on headings and internal links, identify the primary sections of the website (e.g. here is a non-comprehensive list of common sections: Products, Customers, Testimonials, Use Cases, Company, Team, Contact, Blog, About).
2. **Prioritize Crawling**: Determine the order in which to crawl these sections. Prioritize sections that are likely to provide the most valuable information first and ignore sections that are not likely to contain what you are looking for.
3. **Resource Management**: Ensure efficient use of resources by avoiding redundant crawling (e.g., multiple visits to the same page or section).

Next Steps:
- Return an array of Internal Links to visit that might contain the data to achieve the goal.

Expected Output:
- A list of Internal Links as strings:
  - https://www.example1.com
  - https://www.example2.com
  - https://www.example3.com
`;

export { CRAWL_PLAN_TEMPLATE_V1, CRAWL_PLAN_TEMPLATE_V2 };

// Version constants
const VERSION_MAP = {
  '1.0': CRAWL_PLAN_TEMPLATE_V1,
  '2.0': CRAWL_PLAN_TEMPLATE_V2,
};

// Template class
export class SiteCrawlPlanTemplate extends BaseTemplate {
  constructor(version: string = '1.0') {
    const template = VERSION_MAP[version];
    if (!template) {
      throw new Error(`Template version ${version} not found`);
    }
    super(template, version);
  }

  static create(version: string = '1.0') {
    return new SiteCrawlPlanTemplate(version);
  }
}
