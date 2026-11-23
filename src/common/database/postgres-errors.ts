import { DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError } from 'pg';

export function isUniqueViolation(error: unknown, constraint: string): boolean {
  const pgError = error instanceof DrizzleQueryError ? error.cause : error;

  return (
    pgError instanceof DatabaseError &&
    pgError.code === '23505' &&
    pgError.constraint === constraint
  );
}