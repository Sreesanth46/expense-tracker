CREATE TYPE "public"."category" AS ENUM('Housing', 'Utilities', 'Groceries', 'Food', 'Transportation', 'Healthcare', 'Entertainment', 'Shopping', 'Education', 'Travel', 'Subscriptions', 'Debt Payments', 'Taxes', 'Gifts', 'Miscellaneous', 'Personal Care', 'Insurance', 'Savings', 'Others');--> statement-breakpoint
CREATE TABLE "card_statement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credit_card_id" uuid NOT NULL,
	"month" varchar(50) NOT NULL,
	"year" real NOT NULL,
	"statement_pdf_url" varchar(255),
	"total_due" real DEFAULT 0 NOT NULL,
	"paid" real DEFAULT 0 NOT NULL,
	"due_date" timestamp NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_card" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"last_four_digits" varchar(4) NOT NULL,
	"bank" varchar(255) NOT NULL,
	"current_balance" real DEFAULT 0 NOT NULL,
	"due_date" timestamp,
	"userId" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friend" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"total_owed" real DEFAULT 0 NOT NULL,
	"avatar" varchar(255),
	"userId" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "friend_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"color" varchar(20),
	"description" varchar(255),
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_for_friend" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid,
	"friend_id" uuid,
	"is_settled" boolean DEFAULT false NOT NULL,
	"settled_amount" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" varchar(255) NOT NULL,
	"amount" real NOT NULL,
	"credit_card_id" uuid,
	"category" "category",
	"is_emi" boolean DEFAULT false NOT NULL,
	"emi_details" jsonb,
	"tax" real DEFAULT 0,
	"interest" real DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"hashed_password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "card_statement" ADD CONSTRAINT "card_statement_credit_card_id_credit_card_id_fk" FOREIGN KEY ("credit_card_id") REFERENCES "public"."credit_card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_card" ADD CONSTRAINT "credit_card_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend" ADD CONSTRAINT "friend_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag" ADD CONSTRAINT "tag_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_for_friend" ADD CONSTRAINT "transaction_for_friend_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_for_friend" ADD CONSTRAINT "transaction_for_friend_friend_id_friend_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."friend"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_credit_card_id_credit_card_id_fk" FOREIGN KEY ("credit_card_id") REFERENCES "public"."credit_card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "emailIndex" ON "user" USING btree ("email");