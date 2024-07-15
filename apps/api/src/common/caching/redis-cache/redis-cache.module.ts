import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '../../../config/config.service';
import { ConfigModule } from '../../../config/config.module';
import * as redisStore from 'cache-manager-redis-store';
import { CachingService } from '../redis-cache/redis-cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: typeof redisStore,
        host: configService.get('REDIS_HOST'),
        port: Number(configService.get('REDIS_PORT')),
        ttl: 10800, // 3 hours
      }),
    }),
  ],
  providers: [CachingService],
  exports: [CachingService, CacheModule],
})
export class RedisCacheModule {}
