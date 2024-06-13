import { ITask } from '../interfaces/task.interface';

export interface IJobManagerService {
  createJob(task: ITask): Promise<any>;
  updateJobStatus(jobId: string, status: string, data?: any): Promise<any>;
  getJobStatus(jobId: string): Promise<any>;
}
