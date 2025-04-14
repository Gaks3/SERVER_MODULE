import { z } from 'zod';

export const listParamsSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional().default(20),
  userId: z.string().optional(),
  sortBy: z
    .enum(['title', 'popularity', 'createdAt'])
    .optional()
    .default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ListParamsSchema = z.infer<typeof listParamsSchema>;
