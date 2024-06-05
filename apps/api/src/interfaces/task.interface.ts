export interface ITask {
  type: TaskType;
  details: TaskDetails;
  goal: string;
}

export type TaskType = 'structured-data-extraction' | 'seo-analysis';

export interface TaskDetails {
  prompt: string;
  url?: string;
  schema?: any;
}
