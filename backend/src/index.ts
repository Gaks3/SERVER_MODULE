import { serve } from '@hono/node-server';
import { serveStatic } from 'hono/serve-static';
import fs from 'fs-extra';

import createApp from './lib/create-app.js';
import { auth } from './lib/auth.js';
import users from './routes/users/users.router.js';
import games from './routes/games/games.router.js';

const app = createApp()
  .use(
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
  )
  .basePath('/api')
  .route('/users', users)
  .route('/games', games);

app.on(['POST', 'GET'], '/auth/*', (c) => auth.handler(c.req.raw));

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
