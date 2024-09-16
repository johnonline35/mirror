import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import {
  TaskComponentType,
  TaskComponents,
} from '../interfaces/task.interface';
import { TASK_COMPONENT_KEY } from './components-registry.decorator';

@Injectable()
export class ComponentsRegistryService {
  private readonly logger = new Logger(ComponentsRegistryService.name);
  private readonly componentsRegistry = new Map<
    TaskComponentType,
    TaskComponents[]
  >();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
  ) {
    this.registerComponents();
  }

  private registerComponents() {
    const providers = this.discoveryService.getProviders();

    providers.forEach((wrapper) => {
      const { instance } = wrapper;
      if (!instance) return;

      const componentType: TaskComponentType = this.reflector.get(
        TASK_COMPONENT_KEY,
        instance.constructor,
      );

      if (componentType) {
        if (!this.componentsRegistry.has(componentType)) {
          this.componentsRegistry.set(componentType, []);
        }
        this.componentsRegistry
          .get(componentType)
          .push(instance as TaskComponents);
      }
    });
  }

  getComponentsByType(componentType: TaskComponentType): TaskComponents[] {
    return this.componentsRegistry.get(componentType) || [];
  }
}
