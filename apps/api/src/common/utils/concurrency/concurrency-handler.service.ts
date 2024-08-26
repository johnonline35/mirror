import { Injectable } from '@nestjs/common';
import Bottleneck from 'bottleneck';

@Injectable()
export class ConcurrentPageDataService {
  async execute<T, R>(
    items: T[],
    concurrencyLimit: number,
    taskFn: (item: T) => Promise<R>,
  ): Promise<(R | null)[]> {
    const limiter = new Bottleneck({
      maxConcurrent: concurrencyLimit,
    });

    const promises = items.map((item) =>
      limiter
        .schedule(() => taskFn(item))
        .catch((error) => {
          console.error(`Error processing item: ${item}`, error);
          return null;
        }),
    );

    return Promise.all(promises);
  }
}

// import { Injectable } from '@nestjs/common';
// import type { default as PLimitType } from 'p-limit';

// @Injectable()
// export class ConcurrentPageDataService {
//   private pLimit: typeof PLimitType | null = null;

//   private async initPLimit(): Promise<void> {
//     if (!this.pLimit) {
//       const module = await import('p-limit');
//       this.pLimit = module.default;
//     }
//   }

//   async execute<T, R>(
//     items: T[],
//     concurrencyLimit: number,
//     taskFn: (item: T) => Promise<R>,
//   ): Promise<R[]> {
//     await this.initPLimit();

//     const limit = this.pLimit!(concurrencyLimit);

//     const promises = items.map(async (item) => {
//       try {
//         return await limit(() => taskFn(item));
//       } catch (error) {
//         console.error(`Error processing item:`, item, error);
//         return null;
//       }
//     });

//     return Promise.all(promises);
//   }
// }

// import { Injectable } from '@nestjs/common';
// import { default as pLimitDefault } from 'p-limit';

// @Injectable()
// export class ConcurrentPageDataService {
//   private pLimit: typeof pLimitDefault;

//   constructor() {
//     this.initPLimit();
//   }

//   private async initPLimit() {
//     const pLimitModule = await import('p-limit');
//     this.pLimit = pLimitModule.default;
//   }

//   async execute<T, R>(
//     items: T[],
//     concurrencyLimit: number,
//     taskFn: (item: T) => Promise<R>,
//   ): Promise<R[]> {
//     if (!this.pLimit) {
//       await this.initPLimit();
//     }

//     const limit = this.pLimit(concurrencyLimit);

//     const promises = items.map(async (item) => {
//       try {
//         return await limit(() => taskFn(item));
//       } catch (error) {
//         console.error(`Error processing item: ${item}`, error);
//         return null;
//       }
//     });

//     return Promise.all(promises);
//   }
// }

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

//     const promises = items.map(async (item) => {
//       try {
//         return await limit(() => taskFn(item));
//       } catch (error) {
//         console.error(`Error processing item: ${item}`, error);
//         return null;
//       }
//     });

//     return Promise.all(promises);
//   }
// }

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
