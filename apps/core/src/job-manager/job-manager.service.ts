import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma/prisma.service';
import { ITask } from '../interfaces/task.interface';
import { WorkflowService } from '../workflows/workflow.service';
import { IJobManagerService } from './job-manager-service.interface';
import { S3ManagerService } from '../common/services/aws/s3-manager/s3-manager.service';

@Injectable()
export class JobManagerService implements IJobManagerService {
  private readonly logger = new Logger(JobManagerService.name);

  constructor(
    private prisma: PrismaService,
    private workflowService: WorkflowService,
    private s3ManagerService: S3ManagerService,
  ) {}

  async createJob(task: ITask, clientId?: string): Promise<any> {
    this.logger.log(`Creating job for task: ${JSON.stringify(task.details)}`);

    const data: any = {
      status: 'started',
      url: task.details.url,
    };

    const job = await this.prisma.job.create({
      data,
    });

    // Associate job with client if clientId is provided
    if (clientId) {
      await this.associateJobWithClient(job.jobId, clientId);
    }

    return { jobId: job.jobId };
  }

  async executeJobInBackground(jobId: string, task: ITask): Promise<any> {
    this.logger.log(`Starting executeJobInBackground with jobId:`, jobId);
    await this.updateJobStatus(jobId, 'in-progress');
    try {
      const result = await this.workflowService.handle(task);

      // Upload the result JSON to S3
      const bucketName = 'client-results-json';
      const key = `jobs/${jobId}/result.json`;
      const s3Url = await this.s3ManagerService.uploadToS3(
        bucketName,
        key,
        result,
      );

      await this.updateJobStatus(jobId, 'completed', s3Url);
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
    s3Url?: any,
  ): Promise<any> {
    this.logger.log(`Updating job status for ${jobId} to ${status}`);
    const dataToUpdate = {
      status,
      s3Url,
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

  async associateJobWithClient(jobId: string, clientId: string): Promise<void> {
    this.logger.log(`Associating job ${jobId} with client ${clientId}`);
    try {
      await this.prisma.job.update({
        where: { jobId },
        data: { clientId },
      });
      this.logger.log(
        `Successfully associated job ${jobId} with client ${clientId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to associate job ${jobId} with client ${clientId}`,
        error.stack,
      );
      throw error;
    }
  }
}
