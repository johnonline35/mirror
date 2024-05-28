import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const correlationId = request.headers['X-Correlation-ID'] || uuidv4();
    const { method, url, headers, body } = request;

    this.logger.log(`[${correlationId}] Incoming request: ${method} ${url}`, {
      headers,
      body,
    });

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsedTime = Date.now() - now;
        this.logger.log(
          `[${correlationId}] Response: ${response.statusCode} - ${elapsedTime}ms`,
        );
      }),
    );
  }
}
