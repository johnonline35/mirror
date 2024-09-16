import { Module } from '@nestjs/common';
import { TaskDispatcherService } from './task-dispatcher.service';
import { WorkersModule } from '../workers/workers.module';

@Module({
  imports: [WorkersModule],
  providers: [TaskDispatcherService],
  exports: [TaskDispatcherService],
})
export class TaskDispatcherModule {}
