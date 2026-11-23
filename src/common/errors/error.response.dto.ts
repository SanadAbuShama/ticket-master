import { z } from "zod";
import { ErrorCode, messageByCode } from "./error.codes.js";
import { errorBodySchema } from "./error.types.js";

export const errorResponseFor = (code: ErrorCode) =>
  z.object({
    error: errorBodySchema.extend({
      code: z.literal(code),
      message: z.string().meta({ example: messageByCode[code] }),
    }),
  });