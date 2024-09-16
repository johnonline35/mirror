import { ITask } from '../../interfaces/task.interface';
import { WorkerState } from './worker-state';

export interface IWorker {
  state: WorkerState<ITask>;
  execute(task: ITask, initialData?: any, additionalData?: any): Promise<any>;
  handleError(error: Error, task: ITask): void;
}
