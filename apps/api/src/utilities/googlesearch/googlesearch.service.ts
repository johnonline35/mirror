import { Injectable } from '@nestjs/common';
import * as googleIt from 'google-it';
import { TaskComponents } from '../../interfaces/task.interface';

@Injectable()
export class GoogleSearchUtilityService implements TaskComponents {
  name = 'GoogleSearchUtility';
  description = 'Performs Google searches';
  type: 'utility';
  search(query: string): Promise<Array<{ title: string; link: string }>> {
    return googleIt({
      query,
    });
  }
}
