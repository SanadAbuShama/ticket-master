
import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { User } from './user.js';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from '../database/schema/users.js';
import { eq } from 'drizzle-orm';

type UserRow = typeof users.$inferSelect;

/**
 * In-memory stand-in for your data layer (Prisma, Drizzle, TypeORM, ...).
 * Only `User` objects leave this class: password hashes stay inside.
 */
@Injectable()
export class UsersRepository {
    constructor(@InjectDrizzle() private readonly db: NodePgDatabase) { }

    async create(
        email: string,

        { passwordHash = null, emailVerified = false }: { passwordHash?: string | null; emailVerified?: boolean } = {},
    ): Promise<User> {
        const row: UserRow = { email: normalize(email), emailVerified, roles: ['attendee'], passwordHash };

        this.rows.set(row.id, row);

        return toUser(row);
    }

    async findById(id: string): Promise<User | null> {
        const [userRow] = await this.db.select().from(users).where(eq(users.id, id));

        return userRow ? toUser(userRow) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const normalizedEmail = normalize(email);

        const [userRow] = await this.db.select().from(users).where(eq(users.email, normalizedEmail))

        return userRow ? toUser(userRow) : null;
    }

    /** For password sign-in only. */
    async findCredentials(email: string): Promise<{ user: User; passwordHash: string | null } | null> {
        const row = this.findRow(email);
        return row ? { user: toUser(row), passwordHash: row.passwordHash } : null;
    }

    async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
        const row = this.rows.get(id);
        if (row) {
            row.passwordHash = passwordHash;
        }
    }

    async updateEmail(id: string, email: string): Promise<User | null> {
        const row = this.rows.get(id);
        if (!row) {
            return null;
        }
        row.email = normalize(email);
        row.emailVerified = false; // nobody has proven the new address yet
        return toUser(row);
    }
}

// As the package passes addresses to handlers: an accent typed as two code points matches the stored one.
const normalize = (email: string) => email.trim().normalize('NFC').toLowerCase();
const toUser = ({ id, email, name, emailVerified, roles }: UserRow): User => ({ id, name, email, emailVerified, roles });
