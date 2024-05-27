import { IAgent } from './agent.interface';

export abstract class BaseAgent implements IAgent {
  abstract init(context: any): Promise<void>;
  abstract execute(context: any): Promise<void>;
  abstract handleResult(context: any): Promise<void>;

  async run(context: any): Promise<void> {
    try {
      await this.init(context);
      await this.execute(context);
      await this.handleResult(context);
    } catch (error) {
      this.handleError(error, context);
    }
  }

  handleError(error: Error, context: any): void {
    // TODO Implement centralized error handling here
    console.error(`Error in ${this.constructor.name}:`, error.message, context);
  }
}
