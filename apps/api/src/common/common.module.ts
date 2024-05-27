import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { LoggingMiddleware } from './middlewares/logging.middleware';

@Module({
  providers: [CommonService, LoggingMiddleware],
  exports: [CommonService, LoggingMiddleware],
})
export class CommonModule {}
