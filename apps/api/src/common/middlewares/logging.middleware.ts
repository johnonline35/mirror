import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = uuidv4();
    req.headers['X-Correlation-ID'] = correlationId;

    this.logger.log(
      `[${correlationId}] Incoming request: ${req.method} ${req.url}`,
      {
        headers: req.headers,
        body: req.body,
      },
    );

    next();
  }
}
