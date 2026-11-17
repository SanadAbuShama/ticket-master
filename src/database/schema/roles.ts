import { primaryKey, snakeCase, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.js";


export const roles = snakeCase.table('roles', {
    id: uuid().primaryKey().defaultRandom(),
    title: varchar().unique().notNull(),
    description: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date())
});

export const usersRoles = snakeCase.table('users_roles', {
    userId: uuid().notNull().references(() => users.id, { onDelete: 'restrict' }),
    roleId: uuid().notNull().references(() => roles.id, { onDelete: 'restrict' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    primaryKey({ columns: [table.userId, table.roleId] }),
]);