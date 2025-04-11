import { zValidator } from '@hono/zod-validator';
import * as HTTPStatusPhrases from 'stoker/http-status-phrases';
import * as HTTPStatusCodes from 'stoker/http-status-codes';
import { generateId } from 'better-auth';
import { hashPassword } from 'better-auth/crypto';
import { z } from 'zod';

import { authMiddleware } from '../../middlewares/auth.js';
import db from '../../lib/db.js';
import { createRouter } from '../../lib/create-app.js';
import { hasRole } from '../../lib/utils.js';
import { insertUserSchema, passwordSchema } from './users.schema.js';
import { StringIdParamSchema } from '../../lib/schema/param-schema.js';
import { uploadFile } from '../../lib/upload.js';

const users = createRouter()
  .get('/', authMiddleware('admin'), async (c) => {
    const data = await db.user.findMany();

    return c.json({ data });
  })
  .get('/:id', zValidator('param', StringIdParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const user = c.get('user')!;

    const data = await db.user.findUnique({
      where: {
        id,
      },
    });

    if (!data)
      return c.json(
        {
          message: HTTPStatusPhrases.NOT_FOUND,
        },
        HTTPStatusCodes.NOT_FOUND
      );

    if (id !== user.id && !hasRole(user, 'admin'))
      return c.json(
        { message: HTTPStatusPhrases.FORBIDDEN },
        HTTPStatusCodes.FORBIDDEN
      );

    return c.json({ data }, HTTPStatusCodes.OK);
  })
  .post(
    '/',
    authMiddleware('admin'),
    zValidator('json', insertUserSchema),
    async (c) => {
      const data = c.req.valid('json');

      const alreadyExist = await db.user.findUnique({
        where: {
          email: data.email,
        },
      });
      if (alreadyExist)
        return c.json(
          {
            success: false,
            message: HTTPStatusPhrases.BAD_REQUEST,
            description: 'User already exist',
          },
          400
        );

      const user = await db.user.create({
        data: {
          id: generateId(),
          email: data.email,
          name: data.name,
          role: data.role,
          emailVerified: false,
        },
      });

      const hashedPassword = await hashPassword(data.password);

      await db.account.create({
        data: {
          id: generateId(),
          accountId: generateId(),
          providerId: 'credential',
          userId: user.id,
          password: hashedPassword,
        },
      });

      return c.json({ data: user }, HTTPStatusCodes.CREATED);
    }
  )
  .patch(
    '/:id',
    authMiddleware(),
    zValidator('param', StringIdParamSchema),
    zValidator(
      'form',
      insertUserSchema
        .partial()
        .omit({ password: true })
        .extend({
          password: z.union([z.string(), z.undefined(), passwordSchema]),
        })
    ),
    async (c) => {
      const { id } = c.req.valid('param');
      const data = c.req.valid('form');
      const session = c.get('user')!;

      const user = await db.user.findUnique({ where: { id } });

      if (!user)
        return c.json(
          { message: HTTPStatusPhrases.NOT_FOUND },
          HTTPStatusCodes.NOT_FOUND
        );

      if (id !== session.id && !hasRole(session, 'admin'))
        return c.json(
          { message: HTTPStatusPhrases.FORBIDDEN },
          HTTPStatusCodes.FORBIDDEN
        );

      let fileName: string | undefined;

      if (data.image) {
        const upload = await uploadFile(data.image);

        fileName = upload.fileName;
      }

      if (typeof data.password !== 'undefined') {
        const password = await hashPassword(data.password);

        delete data.password;

        await db.account.updateMany({
          where: {
            userId: id,
          },
          data: {
            password,
          },
        });
      } else {
        delete data.password;
      }

      const updatedUser = await db.user.update({
        where: {
          id,
        },
        data: {
          ...data,
          image: fileName,
        },
      });

      return c.json({ data: updatedUser }, HTTPStatusCodes.OK);
    }
  )
  .delete(
    '/:id',
    authMiddleware(),
    zValidator('param', StringIdParamSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const session = c.get('user')!;

      if (id !== session.id && !hasRole(session, 'admin'))
        return c.json(
          { message: HTTPStatusPhrases.FORBIDDEN },
          HTTPStatusCodes.FORBIDDEN
        );

      const user = await db.user.findUnique({ where: { id } });

      if (!user)
        return c.json(
          { message: HTTPStatusPhrases.NOT_FOUND },
          HTTPStatusCodes.NOT_FOUND
        );

      await db.user.delete({
        where: {
          id,
        },
      });

      return c.body(null, HTTPStatusCodes.NO_CONTENT);
    }
  );

export default users;
