CREATE TYPE "user_status" AS ENUM('active', 'deactivated', 'suspended');--> statement-breakpoint
CREATE TYPE "event_status" AS ENUM('draft', 'published', 'cancelled', 'ended');--> statement-breakpoint
CREATE TYPE "ticket_type_status" AS ENUM('hidden', 'visible');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('pending_payment', 'paid', 'expired', 'refunded', 'cancelled');--> statement-breakpoint
CREATE TYPE "ticket_status" AS ENUM('valid', 'checked_in', 'cancelled');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar NOT NULL,
	"email" varchar NOT NULL UNIQUE,
	"password_hash" varchar NOT NULL,
	"status" "user_status" DEFAULT 'active'::"user_status" NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "chk_users_email_lowercase" CHECK ("email" = lower("email"))
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" varchar NOT NULL UNIQUE,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users_roles" (
	"user_id" uuid,
	"role_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_roles_pkey" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"action" varchar NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "roles_permissions" (
	"role_id" uuid,
	"permission_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_permissions_pkey" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar NOT NULL,
	"images" varchar[] DEFAULT '{}'::varchar[] NOT NULL,
	"venue" varchar NOT NULL,
	"description" text,
	"city" varchar NOT NULL,
	"timezone" varchar NOT NULL,
	"created_by" uuid NOT NULL,
	"status" "event_status" DEFAULT 'draft'::"event_status" NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "chk_events_end_after_start" CHECK ("end_date" > "start_date")
);
--> statement-breakpoint
CREATE TABLE "ticket_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" varchar NOT NULL,
	"price" integer NOT NULL,
	"currency" char(3) NOT NULL,
	"capacity" integer NOT NULL,
	"status" "ticket_type_status" DEFAULT 'visible'::"ticket_type_status" NOT NULL,
	"event_id" uuid NOT NULL,
	"sale_start" timestamp with time zone NOT NULL,
	"sale_end" timestamp with time zone NOT NULL,
	"per_order_limit" integer DEFAULT 6 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "chk_ticket_types_price_not_negative" CHECK ("price" >= 0),
	CONSTRAINT "chk_ticket_types_capacity_greater_than_zero" CHECK ("capacity" > 0),
	CONSTRAINT "chk_ticket_types_per_order_limit_greater_than_zero" CHECK ("per_order_limit" > 0),
	CONSTRAINT "chk_ticket_types_sale_end_after_start" CHECK ("sale_end" > "sale_start")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"price" integer NOT NULL,
	"currency" char(3) NOT NULL,
	"ticket_type_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "chk_order_items_quantity_greater_than_zero" CHECK ("quantity" > 0),
	CONSTRAINT "chk_order_items_price_not_negative" CHECK ("price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"status" "order_status" DEFAULT 'pending_payment'::"order_status" NOT NULL,
	"event_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"user_id" uuid,
	"access_token_hash" varchar UNIQUE,
	"buyer_name" varchar NOT NULL,
	"buyer_email" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "chk_orders_buyer_email_lowercase" CHECK ("buyer_email" = lower("buyer_email"))
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar NOT NULL UNIQUE,
	"order_id" uuid NOT NULL,
	"ticket_type_id" uuid NOT NULL,
	"status" "ticket_status" DEFAULT 'valid'::"ticket_status" NOT NULL,
	"checked_in_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "chk_tickets_checked_in_at_matches_status" CHECK (("status" = 'checked_in') = ("checked_in_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX "idx_ticket_types_event_id" ON "ticket_types" ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_order_items_order_id_ticket_type_id" ON "order_items" ("order_id","ticket_type_id");--> statement-breakpoint
CREATE INDEX "idx_orders_event_id" ON "orders" ("event_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_order_id" ON "tickets" ("order_id");--> statement-breakpoint
ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_permission_id_permissions_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_ticket_type_id_ticket_types_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_type_id_ticket_types_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE RESTRICT;