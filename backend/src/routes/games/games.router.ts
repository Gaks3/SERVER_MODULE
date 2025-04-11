import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as HTTPStatusCodes from 'stoker/http-status-codes';
import * as HTTPStatusPhrases from 'stoker/http-status-phrases';
import { IdUUIDParamsSchema, SlugParamsSchema } from 'stoker/openapi/schemas';
import path from 'path';
import fs from 'fs-extra';
import unzipper from 'unzipper';
import slug from 'slug';

import {
  GameSchema,
  ScoreSchema,
} from '../../../prisma/generated/zod/index.js';
import { createRouter } from '../../lib/create-app.js';
import db from '../../lib/db.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { insertGameVersionSchema } from './games.schema.js';
import { imageSchema } from '../../lib/schema/image-schema.js';
import { uploadFile } from '../../lib/upload.js';
import type { Prisma } from '@prisma/client';

const PUBLIC_PATH = path.join(process.cwd(), '/public/games');

const games = createRouter()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        search: z.string().optional(),
        page: z.number().optional(),
        pageSize: z.number().optional().default(20),
        userId: z.string().optional(),
        sort: z.string().optional().default('desc'),
      })
    ),
    async (c) => {
      const { search, page, pageSize, userId, sort } = c.req.valid('query');

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
          createdAt: sort === 'desc' ? 'desc' : 'asc',
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
          totalPlayers: totalPlayers.size,
          scoreCount,
        };
      });

      const totalGames = await db.game.count();

      const isLastPage = ((page ?? 0) + 1) * pageSize >= totalGames;

      return c.json(
        { data: formattedData, page, isLastPage, pageSize },
        HTTPStatusCodes.OK
      );
    }
  )
  // .get(
  //   '/:slug/versions',
  //   authMiddleware(),
  //   zValidator('param', SlugParamsSchema),
  //   async (c) => {
  //     const { slug } = c.req.valid('param');

  //     const data = await db.gameVersion.findUnique({
  //       where: {
  //         id,
  //       },
  //       include: {
  //         game: {
  //           include: {
  //             gameVersion: {
  //               include: {
  //                 score: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     if (!data)
  //       return c.json(
  //         { message: HTTPStatusPhrases.NOT_FOUND },
  //         HTTPStatusCodes.NOT_FOUND
  //       );

  //     return c.json({ data }, HTTPStatusCodes.OK);
  //   }
  // )
  .get(
    '/:slug/scores',
    authMiddleware(),
    zValidator('param', SlugParamsSchema),
    async (c) => {
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

      const data = await db.score.findMany({
        where: {
          gameVersionId: game.id,
        },
        orderBy: {
          score: 'desc',
        },
      });

      return c.json({ data }, HTTPStatusCodes.OK);
    }
  )
  .get(
    '/:slug',
    authMiddleware(),
    zValidator('param', SlugParamsSchema),
    async (c) => {
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
                take: 5,
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
    }
  )
  .post(
    '/',
    authMiddleware('developer'),
    zValidator(
      'form',
      GameSchema.extend({ image: imageSchema }).pick({
        image: true,
        title: true,
        description: true,
      })
    ),
    async (c) => {
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
    }
  )
  .post(
    '/:slug/scores',
    authMiddleware(),
    zValidator('param', SlugParamsSchema),
    zValidator(
      'json',
      ScoreSchema.extend({
        score: z.number().min(1),
      })
    ),
    async (c) => {
      const { slug } = c.req.valid('param');
      const user = c.get('user')!;

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

      const data = await c.req.json();

      const score = await db.score.create({
        data: {
          score: data.score,
          gameVersionId: game.gameVersion[0].id,
          userId: user.id,
        },
      });

      return c.json({ data: score }, HTTPStatusCodes.OK);
    }
  )
  .post(
    '/:slug',
    authMiddleware('developer'),
    zValidator('param', SlugParamsSchema),
    zValidator('form', insertGameVersionSchema.pick({ file: true })),
    async (c) => {
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
          (file) =>
            typeof file === 'string' && file.toLowerCase() === 'index.html'
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
    }
  )
  .put(
    '/:slug',
    authMiddleware('developer'),
    zValidator('param', SlugParamsSchema),
    zValidator(
      'form',
      GameSchema.extend({ image: imageSchema })
        .pick({
          title: true,
          description: true,
          image: true,
        })
        .partial()
    ),
    async (c) => {
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
    }
  )
  .delete(
    '/versions/:id',
    authMiddleware('developer'),
    zValidator('param', IdUUIDParamsSchema),
    async (c) => {
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
    }
  )
  .delete(
    '/:slug',
    authMiddleware('developer'),
    zValidator('param', SlugParamsSchema),
    async (c) => {
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
    }
  );

export default games;
