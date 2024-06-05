import { Injectable, Logger } from '@nestjs/common';
import { AgentState } from '../common/agent-state';
import { ITask } from '../../interfaces/task.interface';
import { IAgent } from '../common/agent.interface';
import { RegisterAgent, AgentType } from '../common/agent-registry';

@Injectable()
@RegisterAgent(AgentType.ValidatePromptAgent)
export class ValidatePromptAgent implements IAgent {
  protected readonly logger = new Logger(ValidatePromptAgent.name);
  state: AgentState<ITask>;

  async init(task: ITask): Promise<void> {
    this.state = new AgentState(task);
    this.state.setInitialized();
    this.logger.log(
      `Initializing ValidatePromptAgent with task: ${JSON.stringify(task)}`,
    );
  }

  async execute(task: ITask): Promise<any> {
    if (!this.state.initialized) {
      throw new Error('Agent not initialized');
    }
    this.logger.log(`Executing: ${JSON.stringify(task)}`);
    // TODO: Implement specific logic here
    return {};
  }

  async handleResult(task: ITask): Promise<void> {
    if (!this.state.error) {
      this.logger.log(`Prompt processing result: ${JSON.stringify(task)}`);
      // TODO handle the result
    } else {
      this.logger.error(
        `Prompt processing failed: ${this.state.error.message}`,
      );
    }
  }

  async handleError(error: Error, task: ITask): Promise<void> {
    this.state.setError(error);
    this.logger.error(
      `Error occurred while processing task ${JSON.stringify(task)}: ${
        error.message
      }`,
    );
    // TODO extra error handling logic: cleanup, notifications, etc.
  }
}
