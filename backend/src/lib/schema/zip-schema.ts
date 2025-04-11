import { z } from 'zod';

export const MAX_FILE_SIZE = 100 * 1024 * 1024;

export const zipSchema = z
  .instanceof(File)
  .refine((file) => file.name.toLowerCase().endsWith('.zip'))
  .refine((file) => file.size > 0)
  .refine((file) => file.size <= MAX_FILE_SIZE);
