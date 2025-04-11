import { z } from 'zod';

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const imageSchema = z
  .instanceof(File)
  .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type), {
    message: `File must be one of the following types: ${ALLOWED_IMAGE_TYPES.join(
      ', '
    )}`,
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: `File size must be less than 5MB.`,
  });
