import { Injectable } from '@nestjs/common';
import { ITask } from '../../interfaces/task.interface';
import { AgentType } from '../../agents/common/agent-registry';
import { TaskDispatcherService } from '../../task-dispatcher/task-dispatcher.service';
import { ConcurrentPageDataService } from '../../common/utils/concurrency/concurrency-handler.service';

@Injectable()
export class ConcurrentAgentExecutionService {
  constructor(
    private readonly taskDispatcher: TaskDispatcherService,
    private readonly concurrentPageDataService: ConcurrentPageDataService,
  ) {}

  async executeAgentConcurrently<TInput, TOutput>(
    inputs: TInput[],
    task: ITask,
    agentType: AgentType,
    concurrencyLimit: number,
  ): Promise<TOutput[]> {
    const taskFn = (input: TInput): Promise<TOutput> =>
      this.taskDispatcher.dispatch(task, agentType, input) as Promise<TOutput>;

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
