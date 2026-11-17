import { sql } from "drizzle-orm";
import { char, check, index, integer, pgEnum, snakeCase, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { events } from "./events.js";

export const ticketTypeStatus = pgEnum('ticket_type_status', ['hidden', 'visible']);

export const ticketTypes = snakeCase.table('ticket_types', {
    id: uuid().primaryKey().defaultRandom(),
    title: varchar().notNull(),
    price: integer().notNull(),
    currency: char({ length: 3 }).notNull(),
    capacity: integer().notNull(),
    status: ticketTypeStatus().notNull().default('visible'),
    eventId: uuid().notNull().references(() => events.id, { onDelete: 'cascade' }),
    saleStart: timestamp({ withTimezone: true }).notNull(),
    saleEnd: timestamp({ withTimezone: true }).notNull(),
    perOrderLimit: integer().notNull().default(6),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date())
}, (table) => [
    check('chk_ticket_types_price_not_negative', sql`${table.price} >= 0`),
    check('chk_ticket_types_capacity_greater_than_zero', sql`${table.capacity} > 0`),
    check('chk_ticket_types_per_order_limit_greater_than_zero', sql`${table.perOrderLimit} > 0`),
    check('chk_ticket_types_sale_end_after_start', sql`${table.saleEnd} > ${table.saleStart}`),
    index('idx_ticket_types_event_id').on(table.eventId)
]);