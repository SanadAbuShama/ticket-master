import { check, index, pgEnum, snakeCase, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { ticketTypes } from "./ticketTypes.js";
import { orders } from "./orders.js";
import { sql } from "drizzle-orm";

export const ticketStatus = pgEnum('ticket_status', ['valid', 'checked_in', 'cancelled']);

export const tickets = snakeCase.table('tickets', {
    id: uuid().primaryKey().defaultRandom(),
    code: varchar().unique().notNull(),
    orderId: uuid().notNull().references(() => orders.id, { onDelete: 'restrict' }),
    ticketTypeId: uuid().notNull().references(() => ticketTypes.id, { onDelete: 'restrict' }),
    status: ticketStatus().notNull().default('valid'),
    checkedInAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date())
}, (table) => [
    check(
        'chk_tickets_checked_in_at_matches_status', sql`(${table.status} = 'checked_in') = (${table.checkedInAt} IS NOT NULL)`,
    ),
    index('idx_tickets_order_id').on(table.orderId)
]);