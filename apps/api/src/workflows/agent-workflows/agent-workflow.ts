// src/workflows/agent-workflows/agent-workflow.ts
import { Injectable, Logger } from '@nestjs/common';
import { ClassificationAgent } from '../../agents/strategies/classification-agent';
import { SummarizationAgent } from '../../agents/strategies/summarization-agent';

@Injectable()
export class AgentWorkflow {
  private readonly logger = new Logger(AgentWorkflow.name);

  constructor(
    private readonly summarizationAgent: SummarizationAgent,
    private readonly classificationAgent: ClassificationAgent,
  ) {}

  async runWorkflow(context: any): Promise<void> {
    try {
      this.logger.log('Starting workflow...');

      await this.summarizationAgent.init(context);
      await this.summarizationAgent.execute();
      await this.summarizationAgent.handleResult();

      await this.classificationAgent.init(context);
      await this.classificationAgent.execute();
      await this.classificationAgent.handleResult();

      this.logger.log('Workflow completed successfully.');
    } catch (error) {
      this.logger.error('Error during workflow execution:', error);
    }
  }
}
