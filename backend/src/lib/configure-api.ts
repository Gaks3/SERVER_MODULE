import { apiReference } from '@scalar/hono-api-reference';

import type { AppOpenAPI } from './types.js';
import { auth } from './auth.js';

export default function configureOpenAPI(app: AppOpenAPI) {
  app.openAPIRegistry.registerComponent('securitySchemes', 'apiKeyCookie', {
    type: 'apiKey',
    in: 'cookie',
    name: 'apiKeyCookie',
    description: 'API Key authentication via cookie',
  });

  app.doc('/doc', {
    openapi: '3.0.0',
    info: {
      version: '0.1.0',
      title: 'PlayX API',
    },
    security: [
      {
        apiKeyCookie: [],
      },
    ],
  });

  app.get('/doc/auth', async (c) => {
    const doc = await auth.api.generateOpenAPISchema();

    return c.json(doc);
  });

  app.get(
    '/reference',
    apiReference({
      theme: 'deepSpace',
      layout: 'modern',
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'fetch',
      },
      sources: [
        {
          title: 'Primary API',
          url: '/doc',
        },
        {
          title: 'Authentication API',
          url: '/doc/auth',
        },
      ],
      title: 'PlayX API',
      pageTitle: 'PLayX API',
    })
  );
}
