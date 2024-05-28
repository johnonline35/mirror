import { Injectable, LoggerService } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Injectable()
export class CustomLoggerService extends Logger implements LoggerService {
  log(message: string, context?: string) {
    super.log(message, context);
  }

  error(message: string, trace: string, context?: string) {
    super.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
  }

  debug(message: string, context?: string) {
    super.debug(message, context);
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context);
  }
}
