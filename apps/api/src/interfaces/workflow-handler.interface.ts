import { ITask } from './task.interface';

export interface IWorkflowHandler {
  handle(prompt: ITask): Promise<any>;
}
