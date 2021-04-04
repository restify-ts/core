import { InjectionToken } from '@ts-stack/di';
import { HttpMethod } from './http-method';
import { NodeRequest, NodeResponse } from './server-options';

export class Router {
  on(method: HttpMethod, path: string, handle: RouteHandler): this {
    return this;
  }

  all(path: string, handle: RouteHandler): this {
    return this;
  }

  find(method: HttpMethod, path: string): RouterReturns {
    return { handle: null, params: null };
  }
}

export type RouteHandler = (
  nodeReq: NodeRequest,
  nodeRes: NodeResponse,
  params: PathParam[],
  queryString: any
) => Promise<void>;

export const PATH_PARAMS = new InjectionToken<PathParam[]>('PATH_PARAMS');
export const QUERY_STRING = new InjectionToken('QUERY_STRING');

export class RouterReturns {
  handle: RouteHandler;
  params: PathParam[];
}

export interface PathParam {
  key: string;
  value: string;
}
