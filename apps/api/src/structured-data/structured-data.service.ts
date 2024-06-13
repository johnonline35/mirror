import { Injectable } from '@nestjs/common';
import { JobManagerService } from '../job-manager/job-manager.service';
import { ITask, TaskComponentType } from '../interfaces/task.interface';
import { StructuredDataDto } from './dtos/structured-data.dto';
import { ComponentsRegistryService } from '../components-registry/components-registry.service';

@Injectable()
export class StructuredDataService {
  constructor(
    private readonly jobManagerService: JobManagerService,
    private readonly componentsRegistryService: ComponentsRegistryService,
  ) {}

  async handle(requestDto: StructuredDataDto) {
    const { prompt, url, schema } = requestDto;

    const tools = this.componentsRegistryService.getComponentsByType(
      TaskComponentType.TOOL,
    );
    const utilities = this.componentsRegistryService.getComponentsByType(
      TaskComponentType.UTILITY,
    );

    const task: ITask = {
      type: 'structured-data-extraction',
      details: {
        prompt,
        url,
        schema,
      },
      goal: `Your task is to extract structured data from the provided unstructured text. The data should be formatted as per the schema defined by the user. The specified schema is as follows: ${JSON.stringify(schema)}. Please ensure the output matches this schema precisely.`,
      components: [...tools, ...utilities],
    };

    const job = await this.jobManagerService.createJob(task);
    return { jobId: job.jobId };
  }

  async getJobStatus(jobId: string) {
    return this.jobManagerService.getJobStatus(jobId);
  }
}
