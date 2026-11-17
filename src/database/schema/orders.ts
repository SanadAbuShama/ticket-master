import { sql } from "drizzle-orm";
import { char, check, index, integer, pgEnum, snakeCase, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { events } from "./events.js";
import { users } from "./users.js";
import { ticketTypes } from "./ticketTypes.js";

export const orderStatus = pgEnum('order_status', ['pending_payment', 'paid', 'expired', 'refunded','cancelled']);

export const orders = snakeCase.table('orders', {
    id: uuid().primaryKey().defaultRandom(),
    status: orderStatus().notNull().default('pending_payment'),
    eventId: uuid().notNull().references(() => events.id, { onDelete: 'restrict' }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    userId: uuid().references(() => users.id, { onDelete: 'restrict' }),
    accessTokenHash: varchar().unique(),
    buyerName: varchar().notNull(),
    buyerEmail: varchar().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date())
}, (table) => [
    check('chk_orders_buyer_email_lowercase', sql`${table.buyerEmail} = lower(${table.buyerEmail})`),
    index('idx_orders_event_id').on(table.eventId)
]);

export const orderItems = snakeCase.table('order_items', {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid().notNull().references(() => orders.id, { onDelete: 'cascade' }),
    price: integer().notNull(),
    currency: char({ length: 3 }).notNull(),
    ticketTypeId: uuid().notNull().references(() => ticketTypes.id, { onDelete: 'restrict' }),
    quantity: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date())
}, (table) => [
    check('chk_order_items_quantity_greater_than_zero', sql`${table.quantity} > 0`),
    check('chk_order_items_price_not_negative', sql`${table.price} >= 0`),
    uniqueIndex('uq_order_items_order_id_ticket_type_id').on(table.orderId, table.ticketTypeId)
]);