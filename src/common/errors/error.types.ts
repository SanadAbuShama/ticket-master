import { ErrorCode } from "./error.codes.js";
import { z } from 'zod'

export const errorDetailSchema = z.object({ field: z.string(), message: z.string() });

export const errorBodySchema = z.object({
  code: z.enum(ErrorCode),
  message: z.string(),
  details: z.array(errorDetailSchema).optional(),
});

export type ErrorDetail = z.infer<typeof errorDetailSchema>;

export type ErrorBody = z.infer<typeof errorBodySchema>
