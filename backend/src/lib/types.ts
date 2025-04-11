import type { PinoLogger } from 'hono-pino';
import type { auth } from './auth.js';

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}
