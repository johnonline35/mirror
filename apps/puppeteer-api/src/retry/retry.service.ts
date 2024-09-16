import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';

export type RetryOptions = retry.Options & {
  logLevel?: 'none' | 'error' | 'verbose';
  customErrorHandler?: (error: Error) => void;
};

class AuthenticationFailureError extends Error {}
class InvalidRequestError extends Error {}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  constructor(private readonly configService: ConfigService) {}

  private shouldBailOut(error: Error): boolean {
    return (
      error instanceof AuthenticationFailureError ||
      error instanceof InvalidRequestError ||
      error.message.includes('Invalid URL')
    );
  }

  async retry<T>(operation: () => Promise<T>): Promise<T> {
    const options = this.configService.get<RetryOptions>('retryOptions');
    if (!options) {
      throw new Error('Retry options not found in configuration');
    }

    return retry(async (bail, attemptNumber) => {
      try {
        return await operation();
      } catch (error) {
        if (options.logLevel === 'verbose') {
          this.logger.log(
            `Attempt ${attemptNumber} failed with error: ${error.message}`,
          );
        } else if (options.logLevel === 'error') {
          this.logger.error(
            `Error on attempt ${attemptNumber}: ${error.message}`,
          );
        }

        if (options.customErrorHandler) {
          options.customErrorHandler(error);
        }

        if (this.shouldBailOut(error)) {
          if (options.logLevel !== 'none') {
            this.logger.error('Bailing out due to fatal error:', error);
          }
          bail(error);
        }

        throw error;
      }
    }, options);
  }
}
