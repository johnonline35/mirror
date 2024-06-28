import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ITask } from '../interfaces/task.interface';
import { WorkflowService } from '../workflow/workflow.service';
import { IJobManagerService } from './job-manager-service.interface';

@Injectable()
export class JobManagerService implements IJobManagerService {
  private readonly logger = new Logger(JobManagerService.name);

  constructor(
    private prisma: PrismaService,
    private workflowService: WorkflowService,
  ) {}

  async createJob(task: ITask): Promise<any> {
    this.logger.log(`Creating job for task: ${JSON.stringify(task.details)}`);
    const job = await this.prisma.job.create({
      data: {
        status: 'started',
        url: task.details.url,
      },
    });

    const jobResult = await this.executeJob(job.jobId, task);

    return { jobId: job.jobId, result: jobResult };
  }

  private async executeJob(jobId: string, task: ITask): Promise<any> {
    try {
      const result = await this.workflowService.handle(task);
      await this.updateJobStatus(jobId, 'done', result);
      return result;
    } catch (error) {
      this.logger.error(`Job execution failed for job ${jobId}:`, error);
      await this.updateJobStatus(jobId, 'failed');
      throw error;
    }
  }

  async updateJobStatus(
    jobId: string,
    status: string,
    data?: any,
  ): Promise<any> {
    this.logger.log(`Updating job status for ${jobId} to ${status}`);
    const dataToUpdate = {
      status,
      data,
    };
    try {
      return await this.prisma.job.update({
        where: { jobId },
        data: dataToUpdate,
      });
    } catch (error) {
      this.logger.error(
        `Failed to update job status for ${jobId}`,
        error.stack,
      );
      throw error;
    }
  }

  async getJobStatus(jobId: string): Promise<any> {
    return await this.prisma.job.findUnique({
      where: { jobId },
    });
  }
}
