import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, username } from 'better-auth/plugins';

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
  },
  plugins: [
    admin(),
    username({
      minUsernameLength: 4,
      maxUsernameLength: 60,
    }),
  ],
  trustedOrigins: ['http://localhost:3000'],
});
