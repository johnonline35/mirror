// import { Injectable, Logger } from '@nestjs/common';
// import { OpenAiService } from '../../../llm/llms/openai/openai.service';
// import { TemplatesService } from '../../../llm/templates/templates.service';
// import { AgentState } from '../../common/agent-state';
// import { SummarizationContext } from '../../../interfaces/contexts/summarization-context.interface';
// import { ITask } from '../../../interfaces/task.interface';
// import { LLMOptions } from '../../../llm/llm.interface';
// import { IAgent } from '../../common/agent.interface';
// import { AgentType, RegisterAgent } from '../../common/agent-registry';

// @Injectable()
// @RegisterAgent(AgentType.WebsiteTypeDetection)
// export class WebsiteTypeDetection implements IAgent {
//   state: AgentState<SummarizationContext & ITask>;
//   protected readonly logger = new Logger(WebsiteTypeDetection.name);

//   constructor(
//     private readonly openAiService: OpenAiService,
//     private readonly templatesService: TemplatesService,
//   ) {}

//   async init(context: SummarizationContext & ITask): Promise<void> {
//     this.state = new AgentState(context);
//     this.state.setInitialized();
//     this.logger.log(
//       `Initializing WebsiteTypeDetectionAgent with context: ${JSON.stringify(context)}`,
//     );
//   }

//   async execute(task: ITask): Promise<void> {
//     if (!this.state.initialized) {
//       throw new Error('Agent not initialized');
//     }

//     try {
//       const { extractedHomePage } = this.state.context;
//       const summarizationTemplate =
//         this.templatesService.getSummarizationTemplate('3.0');
//       const summarizationPrompt = summarizationTemplate.render({
//         text: extractedHomePage,
//       });

//       const summarizationOptions: LLMOptions = {
//         model: 'gpt-3.5-turbo-0125',
//         maxTokens: 500,
//         temperature: 0.3,
//       };

//       const summarizedText = await this.openAiService.adapt(
//         summarizationPrompt,
//         summarizationOptions,
//       );
//       this.state.context.summarizedText = summarizedText;
//       this.state.setExecuted();
//     } catch (error) {
//       this.handleError(error, this.state.context);
//     }
//   }

//   async handleResult(): Promise<void> {
//     if (this.state.error) {
//       this.logger.error(`Summarization failed: ${this.state.error.message}`);
//     } else {
//       this.logger.log(`Summarized text: ${this.state.context.summarizedText}`);
//     }
//   }

//   public handleError(
//     error: Error,
//     context: SummarizationContext & ITask,
//   ): void {
//     this.state.setError(error);
//     this.logger.error(
//       `Error in HomepageSummarizationAgent:`,
//       error.message,
//       context,
//     );
//   }
// }
