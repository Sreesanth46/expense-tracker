ALTER TABLE "user" ADD COLUMN "password" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "hashed_password";