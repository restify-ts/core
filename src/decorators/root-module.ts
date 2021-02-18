import { makeDecorator, Provider, ReflectiveInjector, Injector } from '@ts-stack/di';

import { PreRequest } from '../services/pre-request';
import { ModuleDecorator } from './module';
import { BodyParserConfig } from '../types/types';
import { Logger, LoggerConfig } from '../types/logger';

import { DefaultLogger } from '../services/default-logger';
import { PreRouting } from '../pre-routing';
import { AppMetadata } from './app-metadata';

export const defaultProvidersPerApp: Readonly<Provider[]> = [
  LoggerConfig,
  { provide: Logger, useClass: DefaultLogger },
  BodyParserConfig,
  PreRequest,
  {
    provide: ReflectiveInjector,
    useExisting: Injector,
  },
  PreRouting
];

export interface RootModuleDecoratorFactory {
  (data?: RootModuleDecorator): any;
  new (data?: RootModuleDecorator): RootModuleDecorator;
}

export interface RootModuleDecorator extends ModuleDecorator, Partial<AppMetadata> {}

export const RootModule = makeDecorator('RootModule', (data: any) => data) as RootModuleDecoratorFactory;
