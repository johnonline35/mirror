// src/services/job-manager.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ITask } from '../interfaces/task.interface';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class JobManagerService {
  private readonly logger = new Logger(JobManagerService.name);

  constructor(
    private prisma: PrismaService,
    private workflowService: WorkflowService,
  ) {}

  async createJob(task: ITask) {
    this.logger.log(`Creating job for task: ${JSON.stringify(task.details)}`);
    const job = await this.prisma.job.create({
      data: {
        status: 'started',
        url: task.details.url,
      },
    });

    this.executeJob(job.jobId, task);

    return job;
  }

  private async executeJob(jobId: string, task: ITask) {
    try {
      const result = await this.workflowService.handle(task);
      await this.updateJobStatus(jobId, 'done', result);
    } catch (error) {
      this.logger.error(`Job execution failed for job ${jobId}:`, error);
      await this.updateJobStatus(jobId, 'failed');
    }
  }

  async updateJobStatus(jobId: string, status: string, data?: any) {
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

  async getJobStatus(jobId: string) {
    return await this.prisma.job.findUnique({
      where: { jobId },
    });
  }
}
