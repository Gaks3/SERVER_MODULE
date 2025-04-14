import { createMessageObjectSchema } from 'stoker/openapi/schemas';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';

export const notFoundSchema = createMessageObjectSchema(
  HttpStatusPhrases.NOT_FOUND
);

export const forbiddenSchema = createMessageObjectSchema(
  HttpStatusPhrases.FORBIDDEN
);

export const badRequestSchema = createMessageObjectSchema(
  HttpStatusPhrases.BAD_REQUEST
);

export const internalServerSchema = createMessageObjectSchema(
  HttpStatusPhrases.INTERNAL_SERVER_ERROR
);
