import { ITask } from '../../../interfaces/task.interface';

export interface ICrawlerStrategy {
  execute(task: ITask): Promise<any>;
}
