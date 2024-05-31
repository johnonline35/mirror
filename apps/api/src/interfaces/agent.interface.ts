import { ITask } from './task.interface';
import { ITool } from './tool.interface';

export interface IAgent<TContext extends ITask = ITask> {
  execute(task: TContext): Promise<any>;
  setTool(tool: ITool<TContext>): void;
  reflect(result: any): Promise<any>;
  refine(task: TContext, feedback: any): Promise<TContext>;
  handleResult(task: TContext, result: any): Promise<void>;
  handleError(error: Error, task: TContext): void;
  run(task: TContext): Promise<void>;
}
