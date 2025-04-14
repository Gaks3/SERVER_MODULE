import { requestId } from 'hono/request-id';
import { pinoLogger } from 'hono-pino';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';
import { defaultHook } from 'stoker/openapi';
import { cors } from 'hono/cors';

import { sessionMiddleware } from '../middlewares/session.js';
import type { AppBindings } from './types.js';
import { OpenAPIHono } from '@hono/zod-openapi';

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();
  app
    .use(requestId())
    .use(serveEmojiFavicon('📝'))
    .use(pinoLogger())
    .use(
      cors({
        origin: ['http://localhost:3000'],
        credentials: true,
      })
    )
    .use(sessionMiddleware());

  app.notFound(notFound);
  app.onError(onError);
  return app;
}
