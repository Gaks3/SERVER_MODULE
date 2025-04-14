import type { Schema } from 'hono';
import type { PinoLogger } from 'hono-pino';
import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';

import type { auth } from './auth.js';

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}

export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
