import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

@Injectable()
export class HealthService {
  constructor(@InjectDrizzle() private readonly db: NodePgDatabase) { }

  async checkDatabase(): Promise<'ok' | 'error'> {
    try {
      await this.db.execute(sql`select 1`);
      return 'ok';
    } catch {
      return 'error';
    }
  }
}
