CREATE TABLE "sessions" (
	"id" text PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"mfa" text
);
--> statement-breakpoint
CREATE INDEX "idx_sessions_user_id" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_expires_at" ON "sessions" ("expires_at");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;