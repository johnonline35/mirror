import { ITask } from '../../interfaces/task.interface';

export interface IWorkflowHandler {
  handle(task: ITask): Promise<any>;
}
