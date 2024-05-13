import * as retry from 'async-retry';

export type RetryOptions = retry.Options & {
  logLevel?: 'none' | 'error' | 'verbose';
  customErrorHandler?: (error: Error) => void;
};

class AuthenticationFailureError extends Error {}
class InvalidRequestError extends Error {}

function shouldBailOut(error: Error): boolean {
  return (
    error instanceof AuthenticationFailureError ||
    error instanceof InvalidRequestError
  );
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  return retry(async (bail, attemptNumber) => {
    try {
      return await operation();
    } catch (error) {
      if (options.logLevel === 'verbose') {
        console.log(
          `Attempt ${attemptNumber} failed with error: ${error.message}`,
        );
      } else if (options.logLevel === 'error') {
        console.error(`Error on attempt ${attemptNumber}: ${error.message}`);
      }

      if (options.customErrorHandler) {
        options.customErrorHandler(error);
      }

      if (shouldBailOut(error)) {
        if (options.logLevel !== 'none') {
          console.error('Bailing out due to fatal error:', error);
        }
        bail(error);
      }

      throw error;
    }
  }, options);
}
