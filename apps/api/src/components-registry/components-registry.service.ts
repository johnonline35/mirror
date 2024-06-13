import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import {
  ModuleRef,
  DiscoveryService,
  Reflector,
  ContextIdFactory,
} from '@nestjs/core';
import {
  TaskComponents,
  TaskComponentType,
} from '../interfaces/task.interface';
import { TASK_COMPONENT_METADATA_KEY } from './components-registry.decorator';

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
    private readonly reflector: Reflector,
  ) {
    this.logger.log('ComponentsRegistryService instantiated');
  }

  async onModuleInit() {
    this.logger.log('Registering components...');
    await this.registerComponents();
  }

  private async registerComponents() {
    const providers = this.discoveryService.getProviders();
    this.logger.log(`Found ${providers.length} providers`);
    for (const wrapper of providers) {
      const { instance, metatype } = wrapper;
      if (
        instance &&
        metatype &&
        this.reflector.get(TASK_COMPONENT_METADATA_KEY, metatype)
      ) {
        if (this.isTaskComponent(instance)) {
          try {
            this.logger.log(
              `Found TaskComponent: ${instance.name} of type ${instance.type}. Metatype: ${metatype?.name}`,
            );
            const contextId = ContextIdFactory.create();
            this.moduleRef.registerRequestByContextId({}, contextId);
            const component = await this.moduleRef.resolve(
              metatype as Type<any>,
            );
            this.registerComponent(component);
          } catch (error) {
            this.logger.error(
              `Failed to register TaskComponent: ${instance.name} of type ${instance.type}. Metatype: ${metatype?.name}`,
              error.stack,
            );
          }
        }
      } else {
        this.logger.log(
          `Skipping provider: ${instance?.constructor?.name || 'unknown'}`,
        );
      }
    }
  }

  private isTaskComponent(instance: any): instance is TaskComponents {
    return (
      instance.name &&
      instance.description &&
      (instance.type === TaskComponentType.TOOL ||
        instance.type === TaskComponentType.UTILITY)
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
