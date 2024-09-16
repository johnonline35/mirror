import { TaskComponents } from '../interfaces/task.interface';
import { ITask } from '../interfaces/task.interface';

export interface ITool<T extends ITask> extends TaskComponents {
  execute(task: T, strategyType: string): Promise<any>;
  reflect?(result: any): Promise<any>;
  refine?(task: T, feedback: any): Promise<T>;
}
