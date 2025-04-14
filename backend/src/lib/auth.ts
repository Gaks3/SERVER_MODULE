import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, createAuthMiddleware, openAPI } from 'better-auth/plugins';

import db from './db.js';

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: 'mysql' }),
  appName: 'Hono API',
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 5,
    maxPasswordLength: 10,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [admin(), openAPI()],
  trustedOrigins: ['http://localhost:3000'],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith('/sign-in')) {
        const newSession = ctx.context.newSession;

        if (newSession) {
          await db.user.update({
            where: {
              id: newSession.user.id,
            },
            data: {
              lastLoginAt: new Date(),
            },
          });
        }
      }
    }),
  },
});
