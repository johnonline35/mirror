// src/agents/types/review-prompt-agent.ts
import { Injectable, Logger } from '@nestjs/common';
import { BaseAgentService } from '../common/base-agent.service';
import { AgentState } from '../common/agent-state';
import { ReviewTask } from '../../interfaces/task.interface';
import { IAgent } from '../../interfaces/agent.interface';
import { RegisterAgent } from '../agent-registry';
import { AgentType } from '../agent-types.enum';

@Injectable()
@RegisterAgent(AgentType.ReviewPrompt)
export class ReviewPromptAgent
  extends BaseAgentService<ReviewTask>
  implements IAgent
{
  protected readonly logger = new Logger(ReviewPromptAgent.name);

  async init(task: ReviewTask): Promise<void> {
    this.state = new AgentState(task);
    this.state.setInitialized();
    this.logger.log(
      `Initializing ReviewPromptAgent with task: ${JSON.stringify(task)}`,
    );
  }

  async execute(task: ReviewTask): Promise<any> {
    this.logger.log(`Executing: ${JSON.stringify(task)}`);
    // TODO: Implement your specific logic here
    return {}; // Replace with actual result
  }

  async handleResult(task: ReviewTask): Promise<void> {
    if (this.state.error) {
      this.logger.error(
        `Prompt processing failed: ${this.state.error.message}`,
      );
    } else {
      this.logger.log(`Prompt processing result: ${JSON.stringify(task)}`);
    }
  }
}
