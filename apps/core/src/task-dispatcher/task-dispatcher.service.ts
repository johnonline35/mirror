import { Injectable, Logger } from '@nestjs/common';
import { IWorker } from '../workers/common/worker.interface';
import { ITask } from '../interfaces/task.interface';
import { WorkerType } from '../workers/common/worker-registry';
import { WorkersService } from '../workers/workers.service';

@Injectable()
export class TaskDispatcherService {
  private readonly logger = new Logger(TaskDispatcherService.name);

  constructor(private readonly workersService: WorkersService) {}

  async dispatch(
    task: ITask,
    workerType: WorkerType,
    additionalData?: any,
  ): Promise<any> {
    try {
      const worker = this.getWorkerForType(workerType);
      if (!worker) {
        throw new Error(`No suitable worker found for type ${workerType}`);
      }
      return await worker.execute(task, additionalData);
    } catch (error) {
      this.logger.error(`Error in dispatchTask: ${error.stack}`);
      throw error;
    }
  }

  private getWorkerForType(workerType: WorkerType): IWorker {
    this.logger.log(`Getting worker for type: ${workerType}`);
    const worker = this.workersService.getWorker(workerType);
    if (!worker) {
      throw new Error(`Worker not found for type ${workerType}`);
    }

    return worker;
  }
}
