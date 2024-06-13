export interface ITask {
  type: TaskType;
  details: TaskDetails;
  components: TaskComponents[];
  goal: string;
}

export type TaskType = 'structured-data-extraction' | 'seo-analysis';

export interface TaskComponents {
  name: string;
  description: string;
  type: TaskComponentType;
}

export enum TaskComponentType {
  TOOL = 'tool',
  UTILITY = 'utility',
}

export interface TaskDetails {
  prompt: string;
  url?: string;
  schema?: any;
}
