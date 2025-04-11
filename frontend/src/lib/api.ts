import { hc } from 'hono/client';

import { AppType } from '../../../backend/src/index';

export const apiClient = hc<AppType>(process.env.NEXT_PUBLIC_BACKEND_URL!);
