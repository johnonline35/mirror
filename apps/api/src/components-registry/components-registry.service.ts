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

// import { Injectable, Logger } from '@nestjs/common';
// import { ModuleRef } from '@nestjs/core';
// import {
//   TaskComponents,
//   TaskComponentType,
// } from '../interfaces/task.interface';
// import {
//   createTaskComponentRegistrySymbol,
//   createTaskComponentSymbol,
// } from './components-registry.decorator';

// @Injectable()
// export class ComponentsRegistryService {
//   private readonly logger = new Logger(ComponentsRegistryService.name);
//   private readonly componentsRegistry = new Map<
//     TaskComponentType,
//     TaskComponents[]
//   >();

//   constructor(private readonly moduleRef: ModuleRef) {
//     this.logger.log('ComponentsRegistryService instantiated');
//   }

//   getComponentsByType(componentType: TaskComponentType): TaskComponents[] {
//     // Get all the keys that are registered for all component types
//     const taskComponentTypeProvideKeys: Set<string> = this.moduleRef.get(
//       createTaskComponentRegistrySymbol(),
//     );

//     // Create the symbol prefix for the specific component type we are looking for
//     // (i.e. this will be TASKCOMPONENT_UTILITY_ for TaskComponentType.UTILITY)
//     const symbolPrefixForComponentType = createTaskComponentSymbol(
//       componentType,
//       '',
//     );

//     // Get just the keys that are for the specific component type we are looking for
//     const symbolsForTaskComponentsForType = Array.from(
//       taskComponentTypeProvideKeys,
//     ).filter((key) => key.startsWith(symbolPrefixForComponentType));

//     // Get all the components the keys we got
//     const components: TaskComponents[] = symbolsForTaskComponentsForType.map(
//       (symbol) => this.moduleRef.get(symbol),
//     );

//     return components;
//   }
// }
