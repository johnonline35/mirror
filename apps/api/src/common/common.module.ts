import { Module, Global } from '@nestjs/common';
import { RedisCacheModule } from './caching/redis-cache/redis-cache.module';
import { ConfigModule } from '../config/config.module';
import { UtilitiesModule } from './utils/utilities.module';
import { PrismaService } from './utils/prisma/prisma.service';

@Module({
  imports: [RedisCacheModule, ConfigModule, UtilitiesModule],
  providers: [PrismaService],
  exports: [RedisCacheModule, UtilitiesModule, PrismaService],
})
@Global()
export class CommonModule {}
