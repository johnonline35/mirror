import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { WorkerType, WORKER_METADATA_KEY } from './common/worker-registry';
import { IWorker } from './common/worker.interface';

@Injectable()
export class WorkersService implements OnModuleInit {
  private workerMap: Map<WorkerType, IWorker> = new Map();
  private readonly logger = new Logger(WorkersService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    this.registerWorkers();
  }

  private registerWorkers() {
    const providers = this.discoveryService.getProviders();
    this.logger.debug(`Discovered ${providers.length} providers`);

    providers.forEach((wrapper) => {
      const { instance } = wrapper;
      if (!instance || !instance.constructor) {
        return;
      }

      const workerType = this.reflector.get<WorkerType>(
        WORKER_METADATA_KEY,
        instance.constructor,
      );

      if (workerType) {
        this.logger.debug(`Registering worker: ${workerType}`);

        this.workerMap.set(workerType, instance as IWorker);
      }
    });

    this.logger.debug(
      `Registered workers: ${Array.from(this.workerMap.entries())
        .map(([key, value]) => `${key}: ${value.constructor.name}`)
        .join(', ')}`,
    );
  }

  getWorker(workerType: WorkerType): IWorker {
    const worker = this.workerMap.get(workerType);
    if (!worker) {
      this.logger.warn(`Worker not found for type: ${WorkerType[workerType]}`);
    }
    return worker;
  }

  getAllWorkers(): Map<WorkerType, IWorker> {
    return new Map(this.workerMap);
  }
}
