import { Injectable, Logger } from '@nestjs/common';
import { WorkerState } from '../../common/worker-state';
import { ITask } from '../../../interfaces/task.interface';
import { IWorker } from '../../common/worker.interface';
import { RegisterWorker, WorkerType } from '../../common/worker-registry';
import { TemplatesService } from '../../../llm/templates/templates.service';
import { LLMOptions } from '../../../llm/llm.interface';
import { OpenAiService } from '../../../llm/llm-providers/openai/openai.service';
import {
  CrawlSitePlanningContext,
  LlmCrawlingPlan,
} from './crawl-site-planning.interface';

@Injectable()
@RegisterWorker(WorkerType.CrawlSitePlanningWorker)
export class CrawlSitePlanningWorker implements IWorker {
  state: WorkerState<CrawlSitePlanningContext & ITask>;
  protected readonly logger = new Logger(CrawlSitePlanningWorker.name);

  constructor(
    private readonly templatesService: TemplatesService,
    private readonly openAiService: OpenAiService,
  ) {}

  private async initializeWorker(task: ITask): Promise<void> {
    this.state = new WorkerState(task);
    this.state.setInitialized();
    this.logger.log(
      `Initializing CrawlSitePlanningWorker with task: ${JSON.stringify(task)}`,
    );
  }

  async execute(
    task: ITask,
    homepageData: any,
    llmOptions?: LLMOptions,
  ): Promise<CrawlSitePlanningContext> {
    await this.initializeWorker(task);
    if (!this.state.initialized) {
      throw new Error('Worker not initialized');
    }
    this.logger.log(`Executing task: ${JSON.stringify(task)}`);

    try {
      const siteCrawlPlanTemplate =
        this.templatesService.getSiteCrawlPlanTemplate('2.0');
      const renderedTemplate = siteCrawlPlanTemplate.render({
        task: task,
        homepageData: homepageData,
      });

      console.log(`Rendered siteCrawlPlan before submit: ${renderedTemplate}`);

      if (llmOptions) {
        const initialPlan = await this.openAiService.adapt(
          renderedTemplate,
          llmOptions,
        );
        console.log(`Received site crawling plan from LLM: ${initialPlan}`);

        this.state.context.plan = initialPlan as LlmCrawlingPlan;
      } else {
        this.logger.log('Skipping LLM service, no llmOptions provided.');
      }

      this.state.setExecuted();
      return this.state.context;
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
    context: CrawlSitePlanningContext & ITask,
  ): Promise<void> {
    this.state.setError(error);
    this.logger.error(
      `Error occurred while processing task ${JSON.stringify(context)}`,
      error.stack,
    );
  }
}

// @Injectable()
// @RegisterWorker(WorkerType.CrawlSitePlanningWorker)
// export class CrawlSitePlanningWorker implements IWorker {
//   state: WorkerState<CrawlSitePlanningContext & ITask>;
//   protected readonly logger = new Logger(CrawlSitePlanningWorker.name);

//   constructor(
//     private readonly templatesService: TemplatesService,
//     private readonly openAiService: OpenAiService,
//   ) {}

//   private async initializeWorker(task: ITask): Promise<void> {
//     this.state = new WorkerState(task);
//     this.state.setInitialized();
//     this.logger.log(
//       `Initializing ValidatePromptWorker with task: ${JSON.stringify(task)}`,
//     );
//   }

//   async execute(
//     task: ITask,
//     homepageData: any,
//   ): Promise<CrawlSitePlanningContext> {
//     this.initializeWorker(task);
//     if (!this.state.initialized) {
//       throw new Error('Worker not initialized');
//     }
//     this.logger.log(`Executing: ${JSON.stringify(task)}`);

//     try {
//       const siteCrawlPlanTemplate =
//         this.templatesService.getSiteCrawlPlanTemplate('2.0');
//       console.log('homepageData:', homepageData);
//       const renderedTemplate = siteCrawlPlanTemplate.render({
//         task: task,
//         homepageData: homepageData,
//       });

//       console.log(`Rendered siteCrawlPlan before submit: ${renderedTemplate}`);

//       const llmOptions: LLMOptions = {
//         model: 'gpt-4o-mini-2024-07-18',
//         maxTokens: 1000,
//         temperature: 1,
//       };

//       const initialPlan: string = await this.openAiService.adapt(
//         renderedTemplate,
//         llmOptions,
//       );
//       console.log(`Received site crawling plan from LLM: ${initialPlan}`);

//       this.state.context.plan = initialPlan as LlmCrawlingPlan;
//       this.state.setExecuted();
//       return this.state.context;
//     } catch (error) {
//       this.handleError(error, this.state.context);
//       throw error;
//     } finally {
//       if (this.state) {
//         this.state.resetState();
//       }
//     }
//   }

//   async handleError(
//     error: Error,
//     context: CrawlSitePlanningContext & ITask,
//   ): Promise<void> {
//     this.state.setError(error);
//     this.logger.error(
//       `Error occurred while processing task ${JSON.stringify(context)}`,
//       error.stack,
//     );
//     // TODO extra error handling logic: cleanup, notifications, etc.
//   }
// }
