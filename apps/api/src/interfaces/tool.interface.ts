import { TaskComponents } from '../interfaces/task.interface';
import { ITask } from './task.interface';

export interface ITool<T extends ITask> extends TaskComponents {
  execute(task: T): Promise<any>;
  reflect?(result: any): Promise<any>;
  refine?(task: T, feedback: any): Promise<T>;
}
