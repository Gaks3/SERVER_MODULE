import { createRoute, z } from '@hono/zod-openapi';
import * as HTTPStatusCodes from 'stoker/http-status-codes';

import { authMiddleware } from '../../middlewares/auth';
import {
  insertGameVersionSchema,
  listParamsSchema,
  listResponseSchema,
} from './games.schemas';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { IdUUIDParamsSchema, SlugParamsSchema } from 'stoker/openapi/schemas';
import {
  GameSchema,
  GameVersionSchema,
  ScoreSchema,
  UserSchema,
} from '../../../prisma/generated/zod';
import {
  badRequestSchema,
  forbiddenSchema,
  internalServerSchema,
  notFoundSchema,
} from '../../lib/schema/constants';
import { imageSchema } from '../../lib/schema/image-schema';

const tags = ['Games'];

export const list = createRoute({
  path: '/games',
  method: 'get',
  tags,
  request: {
    query: listParamsSchema,
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(listResponseSchema, 'The list of games'),
  },
});

export const listScores = createRoute({
  path: '/games/{slug}/scores',
  method: 'get',
  tags,
  request: {
    params: SlugParamsSchema,
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({ data: z.array(ScoreSchema.extend({ user: UserSchema })) }),
      'The list of scores'
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Game not found'),
  },
});

export const getOne = createRoute({
  path: '/games/{slug}',
  method: 'get',
  tags,
  request: {
    params: SlugParamsSchema,
  },
  middleware: authMiddleware(),
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        data: GameSchema.extend({
          gameVersion: z.array(
            GameVersionSchema.extend({
              score: z.array(
                ScoreSchema.extend({
                  user: UserSchema,
                })
              ),
            })
          ),
          user: UserSchema,
        }),
      }),
      'The requested game'
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Game not found'),
  },
});

export const getStats = createRoute({
  path: '/games/stats',
  method: 'get',
  tags,
  middleware: authMiddleware('developer'),
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        data: z.object({
          totalGames: z.number(),
          totalScores: z.number(),
        }),
      }),
      'the requested games stats'
    ),
  },
});

export const create = createRoute({
  path: '/games',
  method: 'post',
  tags,
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: GameSchema.extend({ image: imageSchema }).pick({
            image: true,
            title: true,
            description: true,
          }),
        },
      },
    },
  },
  middleware: authMiddleware('developer'),
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({ data: GameSchema }),
      'The created game'
    ),
    [HTTPStatusCodes.BAD_REQUEST]: jsonContent(
      badRequestSchema,
      'The request is bad'
    ),
  },
});

export const createScore = createRoute({
  path: '/games/{slug}/scores',
  method: 'post',
  tags,
  request: {
    params: SlugParamsSchema,
    body: jsonContentRequired(
      ScoreSchema.extend({
        score: z.number().min(1),
      }).pick({
        score: true,
        gameVersionId: true,
      }),
      'The score to create'
    ),
  },
  middleware: authMiddleware(),
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        data: ScoreSchema,
      }),
      'The created score'
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Game not found'),
  },
});

export const createGameVersion = createRoute({
  path: '/games/{slug}',
  method: 'post',
  tags,
  request: {
    params: SlugParamsSchema,
    body: {
      content: {
        'multipart/form-data': {
          schema: insertGameVersionSchema.pick({ file: true }),
        },
      },
    },
  },
  middleware: authMiddleware('developer'),
  responses: {
    [HTTPStatusCodes.CREATED]: jsonContent(
      z.object({
        data: GameVersionSchema.extend({
          game: GameSchema,
        }),
      }),
      'The created game version'
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Game not found'),
    [HTTPStatusCodes.BAD_REQUEST]: jsonContent(
      badRequestSchema,
      'Index HTML file not found'
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerSchema,
      'Internal server error'
    ),
  },
});

export const put = createRoute({
  path: '/games/{slug}',
  method: 'put',
  tags,
  request: {
    params: SlugParamsSchema,
    body: {
      content: {
        'multipart/form-data': {
          schema: GameSchema.extend({ image: imageSchema })
            .pick({
              title: true,
              description: true,
              image: true,
            })
            .partial(),
        },
      },
    },
  },
  middleware: authMiddleware('developer'),
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        data: GameSchema,
      }),
      'The updated game'
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Game not found'),
    [HTTPStatusCodes.FORBIDDEN]: jsonContent(forbiddenSchema, 'Forbidden'),
  },
});

export const removeVersion = createRoute({
  path: '/games/versions/:id',
  method: 'delete',
  tags,
  request: {
    params: IdUUIDParamsSchema,
  },
  middleware: authMiddleware('developer'),
  responses: {
    [HTTPStatusCodes.NO_CONTENT]: {
      description: 'Game version deleted',
    },
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Game version not found'
    ),
  },
});

export const remove = createRoute({
  path: '/games/{slug}',
  method: 'delete',
  tags,
  request: {
    params: SlugParamsSchema,
  },
  middleware: authMiddleware('developer'),
  responses: {
    [HTTPStatusCodes.NO_CONTENT]: {
      description: 'Game deleted',
    },
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Game not found'),
  },
});

export type listRoute = typeof list;
export type listScoresRoute = typeof listScores;
export type getOneRoute = typeof getOne;
export type getStatsRoute = typeof getStats;
export type createRoute = typeof create;
export type createScoreRoute = typeof createScore;
export type createGameVersionRoute = typeof createGameVersion;
export type putRoute = typeof put;
export type removeVersionRoute = typeof removeVersion;
export type removeRoute = typeof remove;
