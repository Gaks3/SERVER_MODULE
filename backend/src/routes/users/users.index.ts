import { createRouter } from '../../lib/create-app.js';
import * as routes from './users.routes.js';
import * as handlers from './users.handlers.js';

const router = createRouter()
  .basePath('/api')
  .openapi(routes.list, handlers.list)
  .openapi(routes.getStats, handlers.getStats)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.create, handlers.create)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);

export default router;
