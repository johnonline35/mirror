import { ITask } from './task.interface';

export interface IWorkflowHandler {
  handle(task: ITask): Promise<any>;
}
