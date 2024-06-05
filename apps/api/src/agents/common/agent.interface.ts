import { ITask } from '../../interfaces/task.interface';
import { ITool } from '../../interfaces/tool.interface';
import { AgentState } from './agent-state';

export interface IAgent {
  state: AgentState<ITask>;
  setTool?(tool: ITool<ITask>): void;
  execute(task: ITask): Promise<any>;
  handleResult(task: ITask, result: any): Promise<void>;
  handleError(error: Error, task: ITask): void;
}
