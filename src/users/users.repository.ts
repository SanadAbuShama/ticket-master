
import { Injectable } from '@nestjs/common';
import type { InternalUser, Role, UserRow } from './user.types.js';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from '../database/schema/users.js';
import { and, eq } from 'drizzle-orm';
import { normalizeEmail } from '../common/utils/normalize-email.js';
import { AppError } from '../common/errors/app.error.js';
import { ErrorCode } from '../common/errors/error.codes.js';
import { isUniqueViolation } from '../common/database/postgres-errors.js';

@Injectable()
export class UsersRepository {
    constructor(@InjectDrizzle() private readonly db: NodePgDatabase) { }

    async create(
        email: string,
        { passwordHash, emailVerified = false, name, roles }: { name: string; passwordHash: string; roles: Role[]; emailVerified?: boolean },
    ): Promise<InternalUser> {
        try {
            const [createdUserRow] = await this.db
                .insert(users)
                .values({ name, email: normalizeEmail(email), emailVerified, passwordHash, roles })
                .returning();

            if (!createdUserRow) {
                throw new Error('Insert returned no row');
            }

            return toUser(createdUserRow);
        } catch (error) {
            if (isUniqueViolation(error, 'users_email_key')) {
                throw new AppError(ErrorCode.EMAIL_TAKEN);
            }
            throw error;
        }
    }

    async findById(id: string): Promise<InternalUser | null> {
        const [userRow] = await this.db.select().from(users).where(eq(users.id, id));

        return userRow ? toUser(userRow) : null;
    }

    async findActiveById(id: string): Promise<InternalUser | null> {
        const [userRow] = await this.db.select().from(users).where(and(eq(users.id, id), eq(users.status, 'active')));

        return userRow ? toUser(userRow) : null;
    }

    async findByEmail(email: string): Promise<InternalUser | null> {

        const userRow = await this.findRow(email)

        return userRow ? toUser(userRow) : null;
    }

    async findCredentials(email: string): Promise<{ user: InternalUser; passwordHash: string | null } | null> {
        const userRow = await this.findRow(email);

        return userRow?.status === 'active' ? { user: toUser(userRow), passwordHash: userRow.passwordHash } : null;
    }

    async updatePasswordHash(id: string, passwordHash: string): Promise<void> {

        await this.db.update(users).set({ passwordHash }).where(eq(users.id, id));
    }

    async updateEmail(id: string, email: string): Promise<InternalUser | null> {
        try {
            const [updatedRow] = await this.db.update(users).set({ email: normalizeEmail(email), emailVerified: false }).where(eq(users.id, id)).returning();


            return updatedRow ? toUser(updatedRow) : null;
        } catch (error) {
            if (isUniqueViolation(error, 'users_email_key')) {
                throw new AppError(ErrorCode.EMAIL_TAKEN);
            }
            throw error;
        }
    }

    private async findRow(email: string): Promise<UserRow | null> {
        const normalizedEmail = normalizeEmail(email);

        const [userRow] = await this.db.select().from(users).where(eq(users.email, normalizedEmail))

        return userRow ? userRow : null;
    }
}

const toUser = ({ id, email, name, emailVerified, roles }: UserRow): InternalUser => ({ id, name, email, emailVerified, roles });
