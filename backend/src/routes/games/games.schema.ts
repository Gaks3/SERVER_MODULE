import { GameVersionSchema } from '../../../prisma/generated/zod/index.js';
import { zipSchema } from '../../lib/schema/zip-schema.js';

export const insertGameVersionSchema = GameVersionSchema.pick({
  version: true,
  gameId: true,
}).extend({
  file: zipSchema,
});
