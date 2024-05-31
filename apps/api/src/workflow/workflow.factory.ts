import { Injectable, Logger } from '@nestjs/common';
import { ITask } from '../interfaces/task.interface';
import { IWorkflowHandler } from '../interfaces/workflow-handler.interface';
import { StructuredDataWorkflowHandler } from './handlers/structured-data-workflow.handler';
import { SEOAnalysisWorkflowHandler } from './handlers/seo-analysis-workflow.handler';

@Injectable()
export class WorkflowFactory {
  private readonly logger = new Logger(WorkflowFactory.name);

  constructor(
    private readonly structuredDataWorkflowHandler: StructuredDataWorkflowHandler,
    private readonly seoAnalysisWorkflowHandler: SEOAnalysisWorkflowHandler,
  ) {}

  getWorkflowHandler(task: ITask): IWorkflowHandler {
    switch (task.type) {
      case 'structured-data-extraction':
        return this.structuredDataWorkflowHandler;
      case 'seo-analysis':
        return this.seoAnalysisWorkflowHandler;
      default:
        this.logger.error('No handler found for task type:', task.type);
        throw new Error(`No handler found for task type: ${task.type}`);
    }
  }
}
