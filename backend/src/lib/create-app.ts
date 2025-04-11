import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { pinoLogger } from 'hono-pino';
import { notFound, onError } from 'stoker/middlewares';
import { cors } from 'hono/cors';

import { sessionMiddleware } from '../middlewares/session.js';
import type { AppBindings } from './types.js';

export function createRouter() {
  return new Hono<AppBindings>();
}

export default function createApp() {
  const app = createRouter();
  app
    .use(requestId())
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
