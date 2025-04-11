import { z } from 'zod';

export const StringIdParamSchema = z.object({
  id: z.string().min(1, 'Id required'),
});
