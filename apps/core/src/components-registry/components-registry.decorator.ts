import { SetMetadata } from '@nestjs/common';
import { TaskComponentType } from '../interfaces/task.interface';

export const TASK_COMPONENT_KEY = 'TASK_COMPONENT_KEY';

export function TaskComponent(taskComponentType: TaskComponentType) {
  return SetMetadata(TASK_COMPONENT_KEY, taskComponentType);
}

// import { Provider, Type } from '@nestjs/common';
// import { TaskComponentType } from '../interfaces/task.interface';

// const registry = new Map<TaskComponentType, Type>();

// export function TaskComponent(taskComponentType: TaskComponentType) {
//   return function (constructor: any) {
//     registry.set(taskComponentType, constructor);
//   };
// }

// export function createTaskComponentSymbol(
//   taskComponentType: TaskComponentType,
//   typeName: string,
// ) {
//   return `TASKCOMPONENT_${taskComponentType}_${typeName}`;
// }

// export const createTaskComponentRegistrySymbol = () => `TASKCOMPONENT_REGISTRY`;

// export function getTaskComponentProviders(): Provider[] {
//   const providers: Provider[] = [];

//   const providerKeys: Set<string> = new Set();
//   for (const [type, taskComponent] of registry.entries()) {
//     const provide = createTaskComponentSymbol(type, taskComponent.name);
//     providers.push({
//       provide,
//       useClass: taskComponent,
//     });

//     providerKeys.add(provide);
//   }

//   providers.push({
//     provide: createTaskComponentRegistrySymbol(),
//     useValue: providerKeys,
//   });

//   return providers;
// }
