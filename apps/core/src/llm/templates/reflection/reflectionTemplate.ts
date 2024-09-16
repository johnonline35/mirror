import { BaseTemplate } from '../baseTemplate';

// Template versions
const REFLECTION_TEMPLATE_V2 = `
todo
`;

const REFLECTION_TEMPLATE_V1 = `
You are a highly advanced analysis specialist tasked with reflecting on the output of the initial steps taken so far. Using the generated data, your goal is to evaluate the effectiveness of the initial plan and suggest improvements. Consider how well the extracted data aligns with the original goal and identify any gaps or areas for optimization.

Original Goal:
- This was the original goal for the initial plan: 
User goal: {{{task.details.prompt}}}
Base URL: {{{task.details.url}}}
Rough schema suggestion for returning the structured data back to the user: {{{task.details.schema}}}

Initial plan for your to review to achieve the task goal(s):
{{{initialPlan}}}

This was the raw data given to the LLM for you to review to check and see if more links should be added to the plan to crawl:
{{#if homepageData.internalLinks}}
{{#each homepageData.internalLinks}}
  - Link Name: {{name}}, URL: {{url}}
{{/each}}
{{else}}N/A
{{/if}}

Reflection:
1. Assess Goal Alignment: Rate this plan out of 10.
3. Identify Gaps: Are there any significant sections or internal links that were overlooked? Highlight any missing elements that could enhance the achievement of the goal.

Recommendations:
- Suggest specific actions or adjustments to improve the initial plan. This could include prioritizing different sections, or adding overlooked links.
- Provide a revised list of internal links to visit to better meet the goal.

Expected Output:
- A comprehensive revised list of Internal Links as strings:
  - https://www.example1.com
  - https://www.example2.com
  - https://www.example3.com
`;

export { REFLECTION_TEMPLATE_V1, REFLECTION_TEMPLATE_V2 };

// Version constants
const VERSION_MAP = {
  '1.0': REFLECTION_TEMPLATE_V1,
  '2.0': REFLECTION_TEMPLATE_V2,
};

// Template class
export class ReflectionTemplate extends BaseTemplate {
  constructor(version: string = '1.0') {
    const template = VERSION_MAP[version];
    if (!template) {
      throw new Error(`Template version ${version} not found`);
    }
    super(template, version);
  }

  static create(version: string = '1.0') {
    return new ReflectionTemplate(version);
  }
}
