import { z } from 'zod';
import { normalizeEmail } from '../utils/normalize-email.js';

export const emailSchema = z
  .string()
  .transform(normalizeEmail)
  .pipe(z.email());