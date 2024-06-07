import { BaseTemplate } from '../baseTemplate';

// Template versions
const PROMPT_REVIEW_TEMPLATE_V1 = `
[
  {
    "role": "system",
    "content": "You are a helpful assistant designed to assess whether the task details you have received can be 
    successfully completed as asked in the context of the goal. If it cannot be completed with very good confidence, 
    then please respond to the user and explain to them what they can do to improve their prompt to make it 
    possible to successfully complete. Here is the goal: {{task.goal}}"
  },
  {
    "role": "user",
    "content": \`
Here are the task details:
<TaskDetails>
  Prompt: {{task.details.prompt}}
  URL: {{task.details.url}}
  Schema: {{task.details.schema}}
</TaskDetails>
Available Components:
<Components>
  {{#each task.components}}
    - Name: {{this.name}}, Description: {{this.description}}, Type: {{this.type}}
  {{/each}}
</Components>
    \`
  },
  {
    "role": "assistant",
    "content": "Please provide feedback on whether the task can be successfully completed as per the goal. If not, explain what improvements are needed to the users prompt."
  }
]
`;

// Version constants
const VERSIONS = {
  PROMPT_REVIEW: '1.0',
};

// Template registry
const TEMPLATE_REGISTRY = {
  [VERSIONS.PROMPT_REVIEW]: PROMPT_REVIEW_TEMPLATE_V1,
};

// Template class
export class PromptReviewTemplate extends BaseTemplate {
  constructor(version: string = VERSIONS.PROMPT_REVIEW) {
    const template = TEMPLATE_REGISTRY[version];
    if (!template) {
      throw new Error(`Template version ${version} not found`);
    }
    super(template, version);
  }

  static create(version: string = VERSIONS.PROMPT_REVIEW) {
    return new PromptReviewTemplate(version);
  }
}
