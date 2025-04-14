import { serve } from '@hono/node-server';
import { serveStatic } from 'hono/serve-static';
import fs from 'fs-extra';

import createApp from './lib/create-app.js';
import { auth } from './lib/auth.js';
import configureOpenAPI from './lib/configure-api.js';
import users from './routes/users/users.index.js';
import games from './routes/games/games.index.js';

const app = createApp().route('/', users).route('/', games);

configureOpenAPI(app);

app.use(
  '*',
  serveStatic({
    root: './public/',
    getContent: async (path) => {
      try {
        return await fs.readFile(path);
      } catch (error) {
        console.error('Failed to read file:', error);
        return null;
      }
    },
  })
);

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

export type AppType = typeof app;

export default app;

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) ?? 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
