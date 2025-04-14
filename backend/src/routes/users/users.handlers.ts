import * as HTTPStatusCodes from 'stoker/http-status-codes';
import * as HTTPStatusPhrases from 'stoker/http-status-phrases';
import { generateId } from 'better-auth';
import { hashPassword } from 'better-auth/crypto';

import db from '../../lib/db.js';
import type { AppRouteHandler } from '../../lib/types.js';
import { hasRole } from '../../lib/utils.js';
import { uploadFile } from '../../lib/upload.js';
import type {
  CreateRoute,
  GetOneRoute,
  GetStatsRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from './users.routes.js';
import { UserRole } from '@prisma/client';

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const data = await db.user.findMany();

  return c.json({ data }, HTTPStatusCodes.OK);
};

export const getStats: AppRouteHandler<GetStatsRoute> = async (c) => {
  const totalUsers = await db.user.count();
  const totalRoleUser = await db.user.count({ where: { role: 'user' } });
  const totalRoleDeveloper = await db.user.count({
    where: { role: 'developer' },
  });
  const totalRoleAdmin = await db.user.count({ where: { role: 'admin' } });
  const bannedUsers = await db.user.count({ where: { banned: true } });
  const activeUsers = await db.user.count({ where: { banned: null } });

  const totalGames = await db.game.count();
  const totalScores = (await db.score.findMany()).reduce(
    (totalScores, { score }) => totalScores + score,
    0
  );

  return c.json(
    {
      data: {
        totalUsers,
        bannedUsers,
        roles: [
          { role: UserRole.user, total: totalRoleUser },
          { role: UserRole.developer, total: totalRoleDeveloper },
          { role: UserRole.admin, total: totalRoleAdmin },
        ],
        status: [
          { status: 'active', total: activeUsers },
          { status: 'banned', total: bannedUsers },
        ],
        totalGames,
        totalScores,
      },
    },
    HTTPStatusCodes.OK
  );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
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
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
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
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
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
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
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
};
