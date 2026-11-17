import { sql } from "drizzle-orm";
import { boolean, check, pgEnum, snakeCase, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const userStatus = pgEnum('user_status', ['active', 'deactivated', 'suspended']);

export const users = snakeCase.table('users', {
	id: uuid().primaryKey().defaultRandom(),
    name: varchar().notNull(),
    email: varchar().unique().notNull(),
    passwordHash: varchar().notNull(),
    status: userStatus().notNull().default('active'),
    emailVerified: boolean().notNull().default(false),
    createdAt: timestamp({withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp({withTimezone: true}).$onUpdate(() => new Date())
}, (table) => [
    check('chk_users_email_lowercase', sql`${table.email} = lower(${table.email})`)
]);