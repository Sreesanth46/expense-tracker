ALTER TABLE "friend" DROP CONSTRAINT "friend_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "friend" ADD COLUMN "friendUserId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "friend" ADD CONSTRAINT "friend_friendUserId_user_id_fk" FOREIGN KEY ("friendUserId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend" ADD CONSTRAINT "friend_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend" ADD CONSTRAINT "uniqueFriendPerUser" UNIQUE("friendUserId","email");