import { Injectable } from '@nestjs/common';
import { ITask } from '../../interfaces/task.interface';
import { WorkerType } from '../../workers/common/worker-registry';
import { TaskDispatcherService } from '../../task-dispatcher/task-dispatcher.service';
import { ConcurrentPageDataService } from '../../common/utils/concurrency/concurrency-handler.service';

@Injectable()
export class ConcurrentWorkerExecutionService {
  constructor(
    private readonly taskDispatcher: TaskDispatcherService,
    private readonly concurrentPageDataService: ConcurrentPageDataService,
  ) {}

  async executeWorkerConcurrently<TInput, TOutput>(
    inputs: TInput[],
    task: ITask,
    workerType: WorkerType,
    concurrencyLimit: number,
  ): Promise<TOutput[]> {
    const taskFn = (input: TInput): Promise<TOutput> =>
      this.taskDispatcher.dispatch(task, workerType, input) as Promise<TOutput>;

    const results = await this.concurrentPageDataService.execute(
      inputs,
      concurrencyLimit,
      taskFn,
    );

    // Note this filters out null values to ensure TOutput[] is returned
    // TODO: improve this
    return results.filter((result): result is TOutput => result !== null);
  }
}
