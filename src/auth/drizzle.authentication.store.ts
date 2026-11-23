
import { Injectable } from '@nestjs/common';
import {
    AuthenticationStorage,
    type SessionRecord,
    type SessionStore,
} from '@nestjs/authentication';
import { InjectDrizzle } from '@nestjs/drizzle';
import { and, eq, lt, lte } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sessions } from '../database/schema/index.js';

@Injectable()
export class DrizzleAuthenticationStore
    implements SessionStore {

    constructor(
        @InjectDrizzle() private readonly db: NodePgDatabase,
        storage: AuthenticationStorage,
    ) {
        storage.registerSource({
            sessions: this,
        });
    }

    async getSession(id: string): Promise<SessionRecord | undefined> {
        const [row] = await this.db.select().from(sessions).where(eq(sessions.id, id));
        return row && withoutNulls(row);
    }

    async createSession(record: SessionRecord): Promise<void> {
        await this.db.insert(sessions).values(record);
        await this.db.delete(sessions).where(lte(sessions.expiresAt, record.createdAt));
    }

    async touchSession(id: string, lastActiveAt: Date): Promise<void> {
        await this.db
            .update(sessions)
            .set({ lastActiveAt })
            .where(and(eq(sessions.id, id), lt(sessions.lastActiveAt, lastActiveAt)));
    }

    async deleteSession(id: string): Promise<boolean> {
        const deleted = await this.db.delete(sessions).where(eq(sessions.id, id)).returning({ id: sessions.id });
        return deleted.length > 0;
    }

    async listUserSessions(userId: string): Promise<SessionRecord[]> {
        const rows = await this.db.select().from(sessions).where(eq(sessions.userId, userId));
        return rows.map(withoutNulls);
    }

    async deleteUserSessions(userId: string): Promise<void> {
        await this.db.delete(sessions).where(eq(sessions.userId, userId));
    }
}

type WithoutNulls<T> = { [K in keyof T as null extends T[K] ? never : K]: T[K] } & {
    [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>;
};

function withoutNulls<T extends object>(row: T): WithoutNulls<T> {
    return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== null)) as WithoutNulls<T>;
}
