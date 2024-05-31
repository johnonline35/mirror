import { ITool } from '../../interfaces/tool.interface';
import { IAgent } from '../../interfaces/agent.interface';
import { Logger } from '@nestjs/common';
import { ITask } from '../../interfaces/task.interface';
import { AgentState } from './agent-state';

export abstract class BaseAgentService<TContext extends ITask>
  implements IAgent<TContext>
{
  protected readonly logger: Logger;
  protected tool?: ITool<TContext>;
  protected state: AgentState<TContext>;

  constructor(agentName: string) {
    this.logger = new Logger(agentName);
  }

  setTool(tool: ITool<TContext>): void {
    this.tool = tool;
  }

  async execute(task: TContext): Promise<any> {
    try {
      let result: any;
      if (this.tool) {
        result = await this.tool.execute(task);
      } else {
        result = await this.performTask(task);
      }

      if (this.shouldReflectAndRefine()) {
        result = await this.reflectAndRefine(task, result);
      }

      return result;
    } catch (error) {
      this.logger.error('Error executing task:', error);
      throw error;
    }
  }

  async run(task: TContext): Promise<void> {
    try {
      await this.init(task);
      const result = await this.execute(task);
      await this.handleResult(task, result);
    } catch (error) {
      this.handleError(error, task);
    }
  }

  public handleError(error: Error, task: TContext): void {
    this.logger.error(
      `Error in ${this.constructor.name}:`,
      error.message,
      task,
    );
  }

  protected shouldReflectAndRefine(): boolean {
    return false;
  }

  protected async reflectAndRefine(task: TContext, result: any): Promise<any> {
    let feedback = await this.reflect(result);
    while (feedback.needsImprovement) {
      task = await this.refine(task, feedback);
      result = this.tool
        ? await this.tool.execute(task)
        : await this.performTask(task);
      feedback = await this.reflect(result);
    }
    return result;
  }

  public async reflect(result: any): Promise<any> {
    this.logger.log('result', result);
    return { needsImprovement: false };
  }

  public async refine(task: TContext, feedback: any): Promise<TContext> {
    this.logger.log('feedback', feedback);
    return task;
  }

  abstract init(task: TContext): Promise<void>;
  abstract handleResult(task: TContext, result: any): Promise<void>;
  abstract performTask(task: TContext): Promise<any>;
}
