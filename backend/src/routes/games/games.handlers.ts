import * as HTTPStatusCodes from 'stoker/http-status-codes';
import * as HTTPStatusPhrases from 'stoker/http-status-phrases';
import slug from 'slug';
import path from 'path';
import fs from 'fs-extra';
import unzipper from 'unzipper';

import db from '../../lib/db';
import type { AppRouteHandler } from '../../lib/types';
import type {
  createGameVersionRoute,
  createRoute,
  createScoreRoute,
  getOneRoute,
  getStatsRoute,
  listRoute,
  listScoresRoute,
  putRoute,
  removeRoute,
  removeVersionRoute,
} from './games.routes';
import { uploadFile } from '../../lib/upload';
import type { Prisma } from '@prisma/client';

const PUBLIC_PATH = path.join(process.cwd(), '/public/games');

export const list: AppRouteHandler<listRoute> = async (c) => {
  const { search, page, pageSize, userId, sortBy, sortDir } =
    c.req.valid('query');

  const data = await db.game.findMany({
    where: {
      title: {
        contains: search,
        mode: 'insensitive',
      },
      userId,
      ...(typeof userId === 'undefined' && {
        NOT: {
          gameVersion: {
            none: {
              id: undefined,
            },
          },
        },
      }),
    },
    orderBy: {
      ...((sortBy === 'title' || sortBy === 'createdAt') && {
        [sortBy]: sortDir === 'desc' ? 'desc' : 'asc',
      }),
    },
    include: {
      gameVersion: {
        include: {
          score: true,
        },
      },
    },
    take: pageSize,
    skip: page ? (page - 1) * pageSize : 0,
  });

  const formattedData = data.map((game) => {
    const totalPlayers = new Set();
    let scoreCount = 0;

    game.gameVersion.forEach(({ score }) => {
      score.forEach((score) => {
        if (!totalPlayers.has(score.userId)) {
          totalPlayers.add(score.userId);
        }

        scoreCount += score.score;
      });
    });

    return {
      id: game.id,
      title: game.title,
      slug: game.slug,
      description: game.description,
      image: game.image,
      userId: game.userId,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
      deletedAt: game.deletedAt,
      totalPlayers: totalPlayers.size,
      scoreCount,
    };
  });

  if (sortBy === 'popularity') {
    formattedData.sort((a, b) =>
      sortDir === 'desc'
        ? b.scoreCount - a.scoreCount
        : a.scoreCount - b.scoreCount
    );
  }

  const totalGames = await db.game.count();

  const totalPage = Math.ceil(totalGames / pageSize) || 1;
  const isFirstPage = (page ?? 0) === 0;
  const isLastPage = ((page ?? 0) + 1) * pageSize >= totalGames;

  return c.json(
    {
      data: formattedData,
      page: typeof page === 'number' ? page : 0,
      isLastPage,
      isFirstPage,
      pageSize,
      totalPage,
    },
    HTTPStatusCodes.OK
  );
};

export const listScores: AppRouteHandler<listScoresRoute> = async (c) => {
  const { slug } = c.req.valid('param');

  const game = await db.game.findUnique({
    where: {
      slug,
    },
    include: {
      gameVersion: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!game)
    return c.json(
      { message: HTTPStatusPhrases.NOT_FOUND },
      HTTPStatusCodes.NOT_FOUND
    );

  const data = await db.score.findMany({
    where: {
      gameVersionId: game.gameVersion[0].id,
    },
    orderBy: {
      score: 'desc',
    },
    include: {
      user: true,
    },
  });

  return c.json({ data }, HTTPStatusCodes.OK);
};

export const getOne: AppRouteHandler<getOneRoute> = async (c) => {
  const { slug } = c.req.valid('param');

  const data = await db.game.findUnique({
    where: {
      slug,
    },
    include: {
      gameVersion: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          score: {
            include: {
              user: true,
            },
            orderBy: {
              score: 'desc',
            },
          },
        },
      },
      user: true,
    },
  });

  if (!data)
    return c.json(
      { message: HTTPStatusPhrases.NOT_FOUND },
      HTTPStatusCodes.NOT_FOUND
    );

  return c.json({ data }, HTTPStatusCodes.OK);
};

export const getStats: AppRouteHandler<getStatsRoute> = async (c) => {
  const user = c.get('user')!;

  const totalGames = await db.game.count({
    where: {
      userId: user.id,
    },
  });
  const totalScores = (
    await db.score.findMany({
      where: {
        game: {
          game: {
            userId: user.id,
          },
        },
      },
    })
  ).reduce((totalScores, { score }) => totalScores + score, 0);

  return c.json(
    {
      data: {
        totalGames,
        totalScores,
      },
    },
    HTTPStatusCodes.OK
  );
};

export const create: AppRouteHandler<createRoute> = async (c) => {
  const { title, description, image } = c.req.valid('form');
  const user = c.get('user')!;

  const titleSlug = slug(title, { mode: 'rfc3986' });

  const slugAlreadyExist = await db.game.findUnique({
    where: {
      slug: titleSlug,
    },
  });
  if (slugAlreadyExist)
    return c.json(
      { message: 'Title must be unique' },
      HTTPStatusCodes.BAD_REQUEST
    );

  const upload = await uploadFile(image);

  const data = await db.game.create({
    data: {
      title,
      slug: titleSlug,
      description,
      userId: user.id,
      image: upload.fileName,
    },
  });

  return c.json({ data }, HTTPStatusCodes.OK);
};

export const createScore: AppRouteHandler<createScoreRoute> = async (c) => {
  const { slug } = c.req.valid('param');
  const user = c.get('user')!;

  const data = c.req.valid('json');

  const game = await db.game.findUnique({
    where: {
      slug,
    },
    include: {
      gameVersion: {
        where: {
          id: data.gameVersionId,
        },
      },
    },
  });

  if (!game || game.gameVersion.length === 0)
    return c.json(
      { message: HTTPStatusPhrases.NOT_FOUND },
      HTTPStatusCodes.NOT_FOUND
    );

  const score = await db.score.upsert({
    where: {
      gameVersionId_userId: {
        userId: user.id,
        gameVersionId: data.gameVersionId,
      },
    },
    create: {
      score: data.score,
      gameVersionId: data.gameVersionId,
      userId: user.id,
    },
    update: {
      score: data.score,
    },
  });

  return c.json({ data: score }, HTTPStatusCodes.OK);
};

export const createGameVersion: AppRouteHandler<
  createGameVersionRoute
> = async (c) => {
  const { slug } = c.req.valid('param');

  const game = await db.game.findUnique({
    where: {
      slug,
    },
  });

  if (!game)
    return c.json(
      { message: HTTPStatusPhrases.NOT_FOUND },
      HTTPStatusCodes.NOT_FOUND
    );

  const countGameVersion = await db.gameVersion.count({
    where: {
      gameId: game.id,
    },
  });

  const version = (countGameVersion + 1).toString();

  const form = c.req.valid('form');

  let gamePublicPath = path.join(PUBLIC_PATH, slug, version);

  try {
    await fs.ensureDir(gamePublicPath);

    const buffer = await form.file.arrayBuffer();
    const zipPath = path.join(gamePublicPath, form.file.name);

    await fs.writeFile(zipPath, Buffer.from(buffer));

    await new Promise((resolve, reject) => {
      fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: gamePublicPath }))
        .on('close', resolve)
        .on('error', reject);
    });

    const files = await fs.readdir(gamePublicPath, { recursive: true });
    const indexFile = files.find(
      (file) => typeof file === 'string' && file.toLowerCase() === 'index.html'
    );

    if (indexFile) gamePublicPath = `${gamePublicPath}/index.html`;
    else {
      await fs.remove(gamePublicPath);

      return c.json(
        { message: 'Index HTML not found' },
        HTTPStatusCodes.BAD_REQUEST
      );
    }

    await fs.remove(zipPath);
  } catch (error) {
    console.log('Path: /games/:id/upload', error);
    return c.json(
      {
        message: HTTPStatusPhrases.INTERNAL_SERVER_ERROR,
      },
      HTTPStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const data = await db.gameVersion.create({
    data: {
      path: `/games/${game.slug}/${version}/index.html`,
      version,
      gameId: game.id,
    },
    include: {
      game: true,
    },
  });

  return c.json({ data }, HTTPStatusCodes.CREATED);
};

export const put: AppRouteHandler<putRoute> = async (c) => {
  const { slug } = c.req.valid('param');
  const user = c.get('user')!;

  const game = await db.game.findUnique({
    where: {
      slug,
    },
  });

  if (!game)
    return c.json(
      { message: HTTPStatusPhrases.NOT_FOUND },
      HTTPStatusCodes.NOT_FOUND
    );

  if (game.userId !== user.id)
    return c.json(
      { message: HTTPStatusPhrases.FORBIDDEN },
      HTTPStatusCodes.FORBIDDEN
    );

  const { title, description, image } = c.req.valid('form');

  const dataToUpdate: Prisma.GameUpdateInput = {};

  if (title) dataToUpdate.title = title;
  if (description) dataToUpdate.description = description;
  if (image) {
    const { fileName } = await uploadFile(image);

    dataToUpdate.image = fileName;
  }

  const data = await db.game.update({
    where: {
      slug,
    },
    data: dataToUpdate,
  });

  return c.json({ data }, HTTPStatusCodes.OK);
};

export const removeVersion: AppRouteHandler<removeVersionRoute> = async (c) => {
  const { id } = c.req.valid('param');

  const data = await db.gameVersion.findUnique({
    where: {
      id,
    },
    include: {
      game: true,
    },
  });

  if (!data)
    return c.json(
      { message: HTTPStatusPhrases.NOT_FOUND },
      HTTPStatusCodes.NOT_FOUND
    );

  await fs.remove(path.join(PUBLIC_PATH, data.game.slug, data.version));

  await db.gameVersion.delete({
    where: {
      id,
    },
  });

  return c.body(null, HTTPStatusCodes.NO_CONTENT);
};

export const remove: AppRouteHandler<removeRoute> = async (c) => {
  const { slug } = c.req.valid('param');

  const result = await db.game.deleteMany({
    where: {
      slug,
    },
  });

  if (result.count === 0)
    return c.json(
      { message: HTTPStatusPhrases.NOT_FOUND },
      HTTPStatusCodes.NOT_FOUND
    );

  await fs.remove(path.join(PUBLIC_PATH, slug));

  return c.body(null, HTTPStatusCodes.NO_CONTENT);
};
