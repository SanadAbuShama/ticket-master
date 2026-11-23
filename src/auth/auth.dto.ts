import { z, ZodType } from 'zod';
import { emailSchema } from '../common/schemas/email.schema.js';
import { passwordSchema } from '../common/schemas/password.schema.js';
import { userRole } from '../database/schema/index.js';

export const signUpSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: emailSchema,
  password: passwordSchema,
});

export type SignUpDto = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export type SignInDto = z.infer<typeof signInSchema>;
