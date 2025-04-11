import { createMiddleware } from 'hono/factory';
import * as HTTPStatusPhrases from 'stoker/http-status-phrases';
import * as HTTPStatusCodes from 'stoker/http-status-codes';

import type { UserRoleType } from '../../prisma/generated/zod/index.js';
import { hasRole } from '../lib/utils.js';

export const authMiddleware = (roles?: UserRoleType[] | UserRoleType) => {
  return createMiddleware(async (c, next) => {
    const user = c.get('user');

    if (!user)
      return c.json(
        { message: HTTPStatusPhrases.UNAUTHORIZED },
        HTTPStatusCodes.UNAUTHORIZED
      );
    else if (roles && !hasRole(user, roles))
      return c.json(
        { message: HTTPStatusPhrases.FORBIDDEN },
        HTTPStatusCodes.FORBIDDEN
      );

    await next();
  });
};
