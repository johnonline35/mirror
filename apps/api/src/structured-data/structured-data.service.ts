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

    let schemaString: string;
    try {
      schemaString =
        typeof schema === 'string' ? schema : JSON.stringify(schema);
    } catch (error) {
      throw new Error('Failed to stringify the schema');
    }

    console.log('schemaString', schemaString);

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
        schema: schemaString,
      },
      goal: `Your task is to extract structured data from the provided unstructured text. The data should be formatted as per the schema defined by the user. If the schema is not correctly formated but it is clear what the user wants, then correct the schema but retain as closely as possible what the user wants. The specified user-defined schema is as follows: ${schemaString}.`,
      components: [...tools, ...utilities],
    };

    const jobResult = await this.jobManagerService.createJob(task);
    return { jobId: jobResult.jobId, result: jobResult.result };
  }

  async getJobStatus(jobId: string) {
    return this.jobManagerService.getJobStatus(jobId);
  }
}
