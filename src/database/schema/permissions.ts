import { primaryKey, snakeCase, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { roles } from "./roles.js";

export const permissions = snakeCase.table('permissions', {
    id: uuid().primaryKey().defaultRandom(),
    action: varchar().unique().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date())
});

export const rolesPermissions = snakeCase.table('roles_permissions', {
    roleId: uuid().notNull().references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid().notNull().references(() => permissions.id, { onDelete: 'cascade' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
]);