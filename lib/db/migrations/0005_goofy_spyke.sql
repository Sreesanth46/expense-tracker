ALTER TABLE "credit_card" RENAME COLUMN "current_balance" TO "credit_limit";--> statement-breakpoint
ALTER TABLE "credit_card" ADD COLUMN "billing_date" timestamp;