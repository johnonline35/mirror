import { Module } from '@nestjs/common';
import { TaskDispatcherService } from './task-dispatcher.service';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [AgentsModule],
  providers: [TaskDispatcherService],
  exports: [TaskDispatcherService],
})
export class TaskDispatcherModule {}
