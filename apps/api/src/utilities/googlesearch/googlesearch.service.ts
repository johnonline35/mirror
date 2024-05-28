import { Injectable } from '@nestjs/common';
import * as googleIt from 'google-it';

@Injectable()
export class GoogleSearchService {
  search(query: string): Promise<Array<{ title: string; link: string }>> {
    return googleIt({
      query,
    });
  }
}
