import { sql } from "drizzle-orm";
import { check, pgEnum, text, timestamp, uuid, varchar, snakeCase } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const eventStatus = pgEnum('event_status', ['draft', 'published', 'cancelled', 'ended']);

export const events = snakeCase.table('events', {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar().notNull(),
    images: varchar().array().notNull().default([]),
    venue: varchar().notNull(),
    description: text(),
    city: varchar().notNull(),
    timeZone: varchar('timezone').notNull(),
    createdBy: uuid().notNull().references(() => users.id, { onDelete: 'restrict' }),
    status: eventStatus().notNull().default('draft'),
    startDate: timestamp({ withTimezone: true }).notNull(),
    endDate: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date())
}, (table) => [
    check('chk_events_end_after_start', sql`${table.endDate} > ${table.startDate}`)
]);