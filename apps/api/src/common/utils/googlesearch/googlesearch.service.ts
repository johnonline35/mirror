import { Injectable } from '@nestjs/common';
import * as googleIt from 'google-it';
import {
  TaskComponentType,
  TaskComponents,
} from '../../../interfaces/task.interface';
import { TaskComponent } from '../../../components-registry/components-registry.decorator';

@Injectable()
@TaskComponent(TaskComponentType.UTILITY)
export class GoogleSearchUtilityService implements TaskComponents {
  name = 'GoogleSearchUtility';
  description = 'Performs Google searches';
  type: TaskComponentType = TaskComponentType.UTILITY;
  search(query: string): Promise<Array<{ title: string; link: string }>> {
    return googleIt({
      query,
    });
  }
}
