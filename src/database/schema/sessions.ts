import { text, timestamp, uuid, snakeCase, index, jsonb, } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import type{ MfaState } from "@nestjs/authentication";


export const sessions = snakeCase.table('sessions', {
    id: text().primaryKey(),
    userId: uuid().notNull().references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    lastActiveAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    metadata: jsonb().$type<Record<string, unknown>>(),
    mfa: text().$type<MfaState>(),
},
    (table) => [
        index('idx_sessions_user_id').on(table.userId),
        index('idx_sessions_expires_at').on(table.expiresAt),
    ]);