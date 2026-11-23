CREATE TYPE "user_role" AS ENUM('attendee', 'admin', 'organizer');--> statement-breakpoint
ALTER TABLE "users_roles" DROP CONSTRAINT "users_roles_role_id_roles_id_fkey";--> statement-breakpoint
ALTER TABLE "roles_permissions" DROP CONSTRAINT "roles_permissions_role_id_roles_id_fkey";--> statement-breakpoint
ALTER TABLE "roles_permissions" DROP CONSTRAINT "roles_permissions_permission_id_permissions_id_fkey";--> statement-breakpoint
DROP TABLE "roles";--> statement-breakpoint
DROP TABLE "users_roles";--> statement-breakpoint
DROP TABLE "permissions";--> statement-breakpoint
DROP TABLE "roles_permissions";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "roles" "user_role"[] DEFAULT '{attendee}'::"user_role"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "chk_users_roles_not_empty" CHECK (cardinality("roles") >= 1);