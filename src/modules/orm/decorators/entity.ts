import { makeDecorator, Type, Injector } from 'ts-di';

export interface EntityDecoratorFactory<T = any> {
  (options?: T): any;
  new (options?: T): EntityDecorator & T;
}

export interface EntityDecorator {
  tableName?: string;
}

export const Entity: EntityDecoratorFactory = makeDecorator('Entity', (data: any) => data);

export class StaticEntity {
  static entityMetadata: any;
  static columnMetadata: any;
  static metadata: DatabaseMetadata;
}

export interface DatabaseMetadata {
  databaseService: Type<DatabaseService>;
  tableName: string;
  primaryColumns: string[];
}

export interface DatabaseService {
  query: (...args: any[]) => any;
}

export abstract class EntityInjector extends Injector {}

export abstract class Model {}
export type EntityModel = typeof Model;