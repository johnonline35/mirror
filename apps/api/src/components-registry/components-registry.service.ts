import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DiscoveryService } from '@nestjs/core';
import {
  TaskComponents,
  TaskComponentType,
} from '../interfaces/task.interface';

@Injectable()
export class ComponentsRegistryService implements OnModuleInit {
  private readonly logger = new Logger(ComponentsRegistryService.name);
  private readonly componentsRegistry = new Map<
    TaskComponentType,
    TaskComponents[]
  >();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
  ) {}

  async onModuleInit() {
    this.logger.log('Registering components...');
    await this.registerComponents();
  }

  private async registerComponents() {
    const providers = this.discoveryService.getProviders();
    for (const wrapper of providers) {
      const { instance, metatype } = wrapper;
      if (instance && this.isTaskComponent(instance)) {
        const component = await this.moduleRef.resolve(metatype as Type<any>);
        this.registerComponent(component);
      }
    }
  }

  private isTaskComponent(instance: any): instance is TaskComponents {
    return (
      instance.name &&
      instance.description &&
      (instance.type === 'tool' || instance.type === 'utility')
    );
  }

  private registerComponent(component: TaskComponents) {
    const type: TaskComponentType = component.type;
    if (!this.componentsRegistry.has(type)) {
      this.componentsRegistry.set(type, []);
    }
    this.componentsRegistry.get(type)?.push(component);
    this.logger.log(`Registered ${type}: ${component.name}`);
  }

  getComponentsByType(componentType: TaskComponentType): TaskComponents[] {
    return this.componentsRegistry.get(componentType) || [];
  }

  getAllComponents(): Map<TaskComponentType, TaskComponents[]> {
    return this.componentsRegistry;
  }
}
