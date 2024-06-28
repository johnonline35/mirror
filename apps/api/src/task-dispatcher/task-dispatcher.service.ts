import { Injectable, Logger } from '@nestjs/common';
import { IAgent } from '../agents/common/agent.interface';
import { ITask } from '../interfaces/task.interface';
import { AgentType } from '../agents/common/agent-registry';
import { AgentsService } from '../agents/agents.service';

@Injectable()
export class TaskDispatcherService {
  private readonly logger = new Logger(TaskDispatcherService.name);

  constructor(private readonly agentsService: AgentsService) {}

  async dispatch(
    task: ITask,
    agentType: AgentType,
    additionalData?: any,
  ): Promise<any> {
    try {
      const agent = this.getAgentForType(agentType);
      if (!agent) {
        throw new Error(`No suitable agent found for type ${agentType}`);
      }
      return await agent.execute(task, additionalData);
    } catch (error) {
      this.logger.error(`Error in dispatchTask: ${error.stack}`);
      throw error;
    }
  }

  private getAgentForType(agentType: AgentType): IAgent {
    this.logger.log(`Getting agent for type: ${agentType}`);
    const agent = this.agentsService.getAgent(agentType);
    if (!agent) {
      throw new Error(`Agent not found for type ${agentType}`);
    }
    this.logger.log(`Agent found: ${agent}`);
    return agent;
  }
}
