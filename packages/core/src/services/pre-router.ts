import { Injectable, ReflectiveInjector } from '@ts-stack/di';

import { HttpHandler } from '../types/http-interceptor';
import { HttpMethod } from '../types/http-method';
import { Logger } from '../types/logger';
import { BaseRouteData, PreparedRouteData } from '../types/route-data';
import { PATH_PARAMS, QUERY_STRING, RouteHandler, Router } from '../types/router';
import { ROUTES_EXTENSIONS } from '../types/routes-extensions';
import { NodeReqToken, NodeResponse, NodeResToken, RequestListener } from '../types/server-options';
import { Status } from '../utils/http-status-codes';
import { ExtensionsManager } from './extensions-manager';

@Injectable()
export class PreRouter {
  constructor(
    protected injectorPerApp: ReflectiveInjector,
    protected router: Router,
    protected log: Logger,
    protected extensionsManager: ExtensionsManager
  ) {}

  requestListener: RequestListener = async (nodeReq, nodeRes) => {
    const { method: httpMethod, url } = nodeReq;
    const [uri, queryString] = this.decodeUrl(url).split('?');
    const { handle, params } = this.router.find(httpMethod as HttpMethod, uri);
    if (!handle) {
      this.sendNotFound(nodeRes);
      return;
    }
    await handle(nodeReq, nodeRes, params, queryString);
  };

  async prepareAndSetRoutes() {
    const baseRoutesData: BaseRouteData[] = await this.extensionsManager.init(ROUTES_EXTENSIONS);
    const preparedRouteData: PreparedRouteData[] = [];

    baseRoutesData.forEach((baseRouteData) => {
      const {
        httpMethod,
        path,
        providersPerMod,
        providersPerRoute,
        providersPerReq,
        moduleName,
        prefixPerApp,
        prefixPerMod,
      } = baseRouteData;
      const injectorPerMod = this.injectorPerApp.resolveAndCreateChild(providersPerMod);
      const inj1 = injectorPerMod.resolveAndCreateChild(providersPerRoute);
      const providers = ReflectiveInjector.resolve(providersPerReq);

      const handle = (async (nodeReq, nodeRes, params, queryString) => {
        const inj2 = inj1.resolveAndCreateChild([
          { provide: NodeReqToken, useValue: nodeReq },
          { provide: NodeResToken, useValue: nodeRes },
          { provide: PATH_PARAMS, useValue: params },
          { provide: QUERY_STRING, useValue: queryString },
        ]);
        const inj3 = inj2.createChildFromResolved(providers);

        // First HTTP handler in the chain of HTTP interceptors.
        const chain = inj3.get(HttpHandler) as HttpHandler;
        await chain.handle();
      }) as RouteHandler;

      preparedRouteData.push({ moduleName, prefixPerApp, prefixPerMod, httpMethod, path, handle });
    });

    this.setRoutes(preparedRouteData);
  }

  protected setRoutes(preparedRouteData: PreparedRouteData[]) {
    preparedRouteData.forEach((data) => {
      const { moduleName, prefixPerApp, prefixPerMod, path: rawPath, httpMethod, handle } = data;
      this.checkRoutePath(moduleName, prefixPerApp);
      this.checkRoutePath(moduleName, prefixPerMod);
      const prefix = [prefixPerApp, prefixPerMod].filter((s) => s).join('/');
      const path = this.getPath(prefix, rawPath);

      if (httpMethod == 'ALL') {
        this.router.all(`/${path}`, handle);
      } else {
        this.router.on(httpMethod, `/${path}`, handle);
      }
    });
  }

  protected decodeUrl(url: string) {
    return decodeURI(url);
  }

  protected sendNotFound(nodeRes: NodeResponse) {
    nodeRes.statusCode = Status.NOT_FOUND;
    nodeRes.end();
  }

  /**
   * Compiles the path for the controller given the prefix.
   *
   * - If prefix `/api/posts/:postId` and route path `:postId`, this method returns path `/api/posts/:postId`.
   * - If prefix `/api/posts` and route path `:postId`, this method returns `/api/posts/:postId`
   */
  protected getPath(prefix: string, path: string) {
    const prefixLastPart = prefix?.split('/').slice(-1)[0];
    if (prefixLastPart?.charAt(0) == ':') {
      const reducedPrefix = prefix?.split('/').slice(0, -1).join('/');
      return [reducedPrefix, path].filter((s) => s).join('/');
    } else {
      return [prefix, path].filter((s) => s).join('/');
    }
  }

  protected checkRoutePath(moduleName: string, path: string) {
    if (path?.charAt(0) == '/') {
      throw new Error(`Invalid configuration of route '${path}' (in '${moduleName}'): path cannot start with a slash`);
    }
  }
}
