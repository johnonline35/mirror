import { BaseTemplate } from '../baseTemplate';

// Template versions
const PROMPT_REVIEW_TEMPLATE_V1 = `
[
  {
    "role": "system",
    "content": "You are a helpful assistant designed to assess whether the task details you have received can be successfully completed as asked in the context of the goal. If it cannot be completed with very good confidence, then please respond to the user and explain to them what they can do to improve their prompt to make it possible to successfully complete. Here is the goal: {{task.goal}}"
  },
  {
    "role": "user",
    "content": \`
{
  "taskDetails": {
    "prompt": "{{task.details.prompt}}",
    "url": "{{task.details.url}}",
    "schema": "{{task.details.schema}}"
  },
  "availableComponents": [
    {{#each task.components}}
      {
        "name": "{{this.name}}",
        "description": "{{this.description}}",
        "type": "{{this.type}}"
      }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
    \`
  },
  {
    "role": "assistant",
    "content": "Please provide feedback on whether the task can be successfully completed as per the goal. Respond in the following format:
    {
      \"success\": <true/false>
      {{#unless success}}
      ,
      \"feedback\": \"<detailed feedback here>\"
      {{/unless}}
    }
    Example 1:
    {
      \"success\": false,
      \"feedback\": \"The prompt lacks specific clarity in specifying the schema structure.\"
    }
    Example 2:
    {
      \"success\": false,
      \"feedback\": \"The prompt asked for actions that cannot be achieved using a web crawler and structured data extraction. Please ask for a task that uses these available tools.\"
    }"
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
