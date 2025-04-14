import { z } from '@hono/zod-openapi';
import {
  GameSchema,
  GameVersionSchema,
} from '../../../prisma/generated/zod/index.js';
import { zipSchema } from '../../lib/schema/zip-schema.js';

export const listParamsSchema = z.object({
  search: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'search',
        in: 'query',
      },
      example: 'Title of game',
    }),
  page: z.coerce
    .number()
    .optional()
    .openapi({
      param: {
        name: 'page',
        in: 'query',
      },
      example: 1,
    }),
  pageSize: z.coerce
    .number()
    .optional()
    .default(20)
    .openapi({
      param: {
        name: 'pageSize',
        in: 'query',
      },
      example: 20,
    }),
  userId: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'userId',
        in: 'query',
      },
      example: 'XlX76DY20DEvVqUg2BX6JK3o8UtwrcXm',
    }),
  sortBy: z
    .enum(['title', 'popularity', 'createdAt'])
    .optional()
    .default('createdAt')
    .openapi({
      param: {
        name: 'sortBy',
        in: 'query',
      },
      example: 'title',
    }),
  sortDir: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc')
    .openapi({
      param: {
        name: 'sortDir',
        in: 'query',
      },
      example: 'desc',
    }),
});

export const listResponseSchema = z.object({
  data: z.array(
    GameSchema.extend({
      totalPlayers: z.number(),
      scoreCount: z.number(),
    })
  ),
  page: z.number(),
  isLastPage: z.boolean(),
  isFirstPage: z.boolean(),
  pageSize: z.number(),
  totalPage: z.number(),
});

export const insertGameVersionSchema = GameVersionSchema.pick({
  version: true,
  gameId: true,
}).extend({
  file: zipSchema,
});
