import { Injectable } from '@nestjs/common';
import { JobManagerService } from '../../job-manager/job-manager.service';
import { ITask, TaskComponentType } from '../../interfaces/task.interface';
import { StructuredDataDto } from './dtos/structured-data.dto';
import { ComponentsRegistryService } from '../../components-registry/components-registry.service';
import { SqsService } from '../../common/services/aws/sqs/sqs.service';

@Injectable()
export class StructuredDataService {
  constructor(
    private readonly jobManagerService: JobManagerService,
    private readonly componentsRegistryService: ComponentsRegistryService,
    private readonly sqsService: SqsService,
  ) {}

  async startJobAsync(requestDto: StructuredDataDto, clientId?: string) {
    const { prompt, url, schema } = requestDto;
    const schemaString = this.stringifySchema(schema);

    const tools = this.componentsRegistryService.getComponentsByType(
      TaskComponentType.TOOL,
    );
    const utilities = this.componentsRegistryService.getComponentsByType(
      TaskComponentType.UTILITY,
    );

    const task: ITask = {
      type: 'structured-data-extraction',
      details: { prompt, url, schema: schemaString },
      goal: `Your task is to extract structured data from the provided unstructured text...`,
      components: [...tools, ...utilities],
    };

    // Create the job entry and return the jobId immediately
    const job = await this.jobManagerService.createJob(task, clientId);

    await this.sqsService.sendMessage(
      process.env.JOB_QUEUE_URL,
      JSON.stringify({ jobId: job.jobId, task }),
    );

    // Return the job ID immediately
    return { jobId: job.jobId };
  }

  private stringifySchema(schema: any): string {
    try {
      return typeof schema === 'string' ? schema : JSON.stringify(schema);
    } catch (error) {
      throw new Error('Failed to stringify the schema');
    }
  }
}
