import { ITask } from '../../interfaces/task.interface';
import { ITool } from '../../tools/tools.interface';
import { AgentState } from './agent-state';

export interface IAgent {
  state: AgentState<ITask>;
  setTool?(tool: ITool<ITask>): void;
  execute(task: ITask, initialData?: any, additionalData?: any): Promise<any>;
  handleResult?(task: ITask, result: any): Promise<void>;
  handleError(error: Error, task: ITask): void;
}
