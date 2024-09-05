import { ITask } from '../../interfaces/task.interface';
import { AgentState } from './agent-state';

export interface IAgent {
  state: AgentState<ITask>;
  execute(task: ITask, initialData?: any, additionalData?: any): Promise<any>;
  handleResult?(task: ITask, result: any): Promise<void>;
  handleError(error: Error, task: ITask): void;
}
