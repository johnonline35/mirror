import { Injectable } from '@nestjs/common';
import pLimit from 'p-limit';

@Injectable()
export class ConcurrentPageDataService {
  async execute<T, R>(
    items: T[],
    concurrencyLimit: number,
    taskFn: (item: T) => Promise<R>,
  ): Promise<R[]> {
    const limit = pLimit(concurrencyLimit);

    const promises = items.map(async (item) => {
      try {
        return await limit(() => taskFn(item));
      } catch (error) {
        console.error(`Error processing item: ${item}`, error);
        return null;
      }
    });

    return Promise.all(promises);
  }
}

// import { Injectable } from '@nestjs/common';
// import pLimit from 'p-limit';

// @Injectable()
// export class ConcurrentPageDataService {
//   async execute<T, R>(
//     items: T[],
//     concurrencyLimit: number,
//     taskFn: (item: T) => Promise<R>,
//   ): Promise<R[]> {
//     const limit = pLimit(concurrencyLimit);

//     const promises = items.map((item) => limit(() => taskFn(item)));

//     return Promise.all(promises);
//   }
// }
