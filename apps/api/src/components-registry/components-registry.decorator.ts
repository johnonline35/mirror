import { SetMetadata } from '@nestjs/common';
import { TaskComponentType } from '../interfaces/task.interface';

export const TASK_COMPONENT_METADATA_KEY = 'TASK_COMPONENT_METADATA_KEY';

export const TaskComponent = (type: TaskComponentType): ClassDecorator =>
  SetMetadata(TASK_COMPONENT_METADATA_KEY, type);
