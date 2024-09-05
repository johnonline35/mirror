import { Module, Global } from '@nestjs/common';
import { RedisCacheModule } from './caching/redis-cache/redis-cache.module';
import { ConfigModule } from '../config/config.module';
import { UtilitiesModule } from './utils/utilities.module';
import { ServicesModule } from './services/services.module';
import { PrismaService } from './services/prisma/prisma.service';

@Global()
@Module({
  imports: [RedisCacheModule, ConfigModule, UtilitiesModule, ServicesModule],
  providers: [PrismaService],
  exports: [RedisCacheModule, UtilitiesModule, PrismaService, ServicesModule],
})
export class CommonModule {}
