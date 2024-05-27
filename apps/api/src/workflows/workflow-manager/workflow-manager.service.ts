import { Injectable, Logger } from '@nestjs/common';
import { BaseAgent } from '../../agents/base-agent';

@Injectable()
export class WorkflowManager {
  private readonly logger = new Logger(WorkflowManager.name);

  constructor(private readonly agents: BaseAgent[]) {}

  async execute(context: any): Promise<void> {
    for (const agent of this.agents) {
      await agent.run(context);
    }
  }
}
