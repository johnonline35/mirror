import { ITask } from './task.interface';

export interface ITool<T extends ITask> {
  execute(task: T): Promise<any>;
  reflect(result: any): Promise<any>;
  refine(task: T, feedback: any): Promise<T>;
}
