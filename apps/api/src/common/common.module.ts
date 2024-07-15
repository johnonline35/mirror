import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { RedisCacheModule } from './caching/redis-cache/redis-cache.module';
import { ConfigModule } from '../config/config.module';
import { UtilitiesModule } from './utils/utilities.module';

@Module({
  imports: [RedisCacheModule, ConfigModule, UtilitiesModule],
  providers: [
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggingInterceptor,
    // },
    // {
    //   provide: APP_FILTER,
    //   useClass: AllExceptionsFilter,
    // },
  ],
  exports: [RedisCacheModule, UtilitiesModule],
})
export class CommonModule {}
// export class CommonModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(LoggingMiddleware).forRoutes('*');
//   }
// }
