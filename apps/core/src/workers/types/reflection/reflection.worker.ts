import { Injectable, Logger } from '@nestjs/common';
import { WorkerState } from '../../common/worker-state';
import { ITask } from '../../../interfaces/task.interface';
import { IWorker } from '../../common/worker.interface';
import { RegisterWorker, WorkerType } from '../../common/worker-registry';
import { TemplatesService } from '../../../llm/templates/templates.service';
import { LLMOptions } from '../../../llm/llm.interface';
import { OpenAiService } from '../../../llm/llm-providers/openai/openai.service';
import { ReflectionContext } from './reflection.interface';

@Injectable()
@RegisterWorker(WorkerType.ReflectionWorker)
export class ReflectionWorker implements IWorker {
  state: WorkerState<ReflectionContext & ITask>;
  protected readonly logger = new Logger(ReflectionWorker.name);

  constructor(
    private readonly templatesService: TemplatesService,
    private readonly openAiService: OpenAiService,
  ) {}

  private async initializeWorker(task: ITask): Promise<void> {
    this.state = new WorkerState(task);
    this.state.setInitialized();
    this.logger.log(
      `Initializing ValidatePromptWorker with task: ${JSON.stringify(task)}`,
    );
  }

  async execute(
    task: ITask,
    initialPlan: any,
    homepageData: any,
  ): Promise<ReflectionContext> {
    this.initializeWorker(task);

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

      this.state.context.reflection = reflection as ReflectionContext;
      this.state.setExecuted();
      return this.state.context.reflection;
    } catch (error) {
      this.handleError(error, this.state.context);
      throw error;
    } finally {
      if (this.state) {
        this.state.resetState();
      }
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
