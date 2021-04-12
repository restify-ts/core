import { RouteMetadata } from '../decorators/route';
import { ControllerType, DecoratorMetadata, HttpMethod, NormalizedGuard, ServiceProvider } from './mix';
import { RouteHandler } from './router';

/**
 * This metadata is generated by `ROUTES_EXTENSIONS` group, and available for other extensions
 * that need set routes.
 */
export class RawRouteMeta {
  moduleName: string;
  /**
   * Providers per a module.
   */
  providersPerMod?: ServiceProvider[];
  /**
   * Providers per a route.
   */
  providersPerRoute?: ServiceProvider[];
  /**
   * Providers per a request.
   */
  providersPerReq?: ServiceProvider[];
  prefixPerApp?: string;
  prefixPerMod?: string;
  path: string;
  httpMethod: HttpMethod;
}

/**
 * This metadata is generated by `ROUTES_EXTENSIONS` group, and available via DI per
 * a route.
 */
export class RouteMeta {
  httpMethod: HttpMethod;
  path: string;
  controller: ControllerType;
  /**
   * The controller's method name.
   */
  methodName: string;
  /**
   * Need or not parse body.
   */
  parseBody: boolean;
  /**
   * An array of DI tokens used to look up `CanActivate()` handlers,
   * in order to determine if the current user is allowed to activate the controller.
   * By default, any user can activate.
   */
  guards: NormalizedGuard[];
  /**
   * Route decorator has value of the decorator and ref to other decorators
   * on the same controller's method.
   */
  decoratorMetadata: DecoratorMetadata;
}

/**
 * This metadata is generated by extensions that sets routes.
 */
export interface PreparedRouteMeta {
  moduleName: string;
  prefixPerApp: string;
  prefixPerMod: string;
  httpMethod: HttpMethod;
  path: string;
  handle: RouteHandler;
}
