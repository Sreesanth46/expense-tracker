ALTER TABLE "user" ADD COLUMN "clerk_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_clerk_id_unique" UNIQUE("clerk_id");