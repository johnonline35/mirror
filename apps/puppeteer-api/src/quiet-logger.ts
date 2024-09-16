import { ConsoleLogger } from '@nestjs/common';

export class QuietStartupLogger extends ConsoleLogger {
  private readonly ignoreContexts: Set<string>;

  constructor(enableStartupLogs: boolean) {
    super();
    const x = [
      'RoutesResolver',
      'RouterExplorer',
      'InstanceLoader',
      'NestFactory',
    ];
    this.ignoreContexts = enableStartupLogs ? new Set(x) : new Set();
  }

  log(message: any, ...optionalParams: any[]) {
    if (this.shouldSuppress(optionalParams)) {
      return;
    }

    // eslint-disable-next-line prefer-rest-params
    super.log(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    if (this.shouldSuppress(optionalParams)) {
      return;
    }

    // eslint-disable-next-line prefer-rest-params
    super.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    if (this.shouldSuppress(optionalParams)) {
      return;
    }

    // eslint-disable-next-line prefer-rest-params
    super.debug(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    if (this.shouldSuppress(optionalParams)) {
      return;
    }

    // eslint-disable-next-line prefer-rest-params
    super.error(message, ...optionalParams);
  }

  private shouldSuppress(optionalParams: any[]) {
    if (optionalParams?.length && this.ignoreContexts.has(optionalParams[0])) {
      return true;
    }
    return false;
  }
}
