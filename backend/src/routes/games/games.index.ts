import { createRouter } from '../../lib/create-app';
import * as routes from './games.routes';
import * as handlers from './games.handlers';

const router = createRouter()
  .basePath('/api')
  .openapi(routes.listScores, handlers.listScores)
  .openapi(routes.list, handlers.list)
  .openapi(routes.getStats, handlers.getStats)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.create, handlers.create)
  .openapi(routes.createScore, handlers.createScore)
  .openapi(routes.createGameVersion, handlers.createGameVersion)
  .openapi(routes.put, handlers.put)
  .openapi(routes.removeVersion, handlers.removeVersion)
  .openapi(routes.remove, handlers.remove);

export default router;
