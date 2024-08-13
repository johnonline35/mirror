import { Injectable, Logger } from '@nestjs/common';
import { AgentState } from '../../common/agent-state';
import { ITask } from '../../../interfaces/task.interface';
import { IAgent } from '../../common/agent.interface';
import { RegisterAgent, AgentType } from '../../common/agent-registry';
import { TemplatesService } from '../../../llm/templates/templates.service';
import { LLMOptions } from '../../../llm/llm.interface';
import { OpenAiService } from '../../../llm/llms/openai/openai.service';
import { ReflectionContext } from './reflection.interface';

@Injectable()
@RegisterAgent(AgentType.ReflectionAgent)
export class ReflectionAgent implements IAgent {
  state: AgentState<ReflectionContext & ITask>;
  protected readonly logger = new Logger(ReflectionAgent.name);

  constructor(
    private readonly templatesService: TemplatesService,
    private readonly openAiService: OpenAiService,
  ) {}

  private async initializeAgent(task: ITask): Promise<void> {
    this.state = new AgentState(task);
    this.state.setInitialized();
    this.logger.log(
      `Initializing ValidatePromptAgent with task: ${JSON.stringify(task)}`,
    );
  }

  async execute(
    task: ITask,
    initialPlan: any,
    homepageData: any,
  ): Promise<ReflectionContext> {
    this.initializeAgent(task);

    this.logger.log(`Executing: ${JSON.stringify(task)}`);

    try {
      const reflectionPlanTemplate =
        this.templatesService.getReflectionTemplate('1.0');
      console.log({
        task: task,
        initialPlan: initialPlan,
        homepageData: homepageData,
      });
      const reflectionPlan = reflectionPlanTemplate.render({
        task: task,
        initialPlan: initialPlan,
        homepageData: homepageData,
      });

      console.log(`Reflection plan template post render: ${reflectionPlan}`);

      const llmOptions: LLMOptions = {
        model: 'gpt-4o-mini-2024-07-18',
        maxTokens: 1000,
        temperature: 1,
      };

      const reflection = await this.openAiService.adapt(
        reflectionPlan,
        llmOptions,
      );
      // console.log(
      //   `Received site crawling plan from LLM: ${JSON.stringify(plan)}`,
      // );

      this.state.setContext({ reflection } as Partial<ReflectionContext>);
      this.state.setExecuted();
      return this.state.context.reflection;
    } catch (error) {
      this.handleError(error, this.state.context);
      throw error;
    }
  }

  async handleError(
    error: Error,
    context: ReflectionContext & ITask,
  ): Promise<void> {
    this.state.setError(error);
    this.logger.error(
      `Error occurred while processing task ${JSON.stringify(context)}`,
      error.stack,
    );
    // TODO extra error handling logic: cleanup, notifications, etc.
  }
}
