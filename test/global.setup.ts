import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { existsSync } from 'node:fs';

export default async function setup() {
  if (existsSync('.env.test')) {
    process.loadEnvFile('.env.test');
  }

  const url = process.env.DATABASE_URL ?? '';
  if (!url.endsWith('_test')) {
    throw new Error(`Refusing to run tests against a non-test database: ${url}`);
  }

  const pool = new Pool({ connectionString: url });
  await migrate(drizzle({ client: pool }), { migrationsFolder: './drizzle' });
  await pool.end();
}


