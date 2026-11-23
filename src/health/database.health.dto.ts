import { z } from 'zod';

export const healthResponse = z.object({
  status: 'ok',
  database: 'ok',
});

export type HealthResponse = z.infer<typeof healthResponse>;

