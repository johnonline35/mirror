// src/task-dispatcher/task-dispatcher.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { IAgent } from '../interfaces/agent.interface';
import { ITask } from '../interfaces/task.interface';
import { AgentType } from '../agents/agent-types.enum';
import { getAgent } from '../agents/agent-registry';

@Injectable()
export class TaskDispatcherService {
  private readonly logger = new Logger(TaskDispatcherService.name);

  async dispatch(task: ITask, agentType: AgentType): Promise<any> {
    try {
      const agent = this.getAgentForType(agentType);
      if (!agent) {
        throw new Error(`No suitable agent found for type ${agentType}`);
      }
      return await agent.run(task);
    } catch (error) {
      this.logger.error('Error dispatching task:', error);
      throw error;
    }
  }

  private getAgentForType(agentType: AgentType): IAgent {
    const agent = getAgent(agentType);
    if (!agent) {
      throw new Error(`Agent not found for type ${agentType}`);
    }
    return agent;
  }
}
