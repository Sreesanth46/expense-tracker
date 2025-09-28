import { pgTable, real, uuid, varchar } from 'drizzle-orm/pg-core';
import { dateMixin } from './mixin';
import { UserTable } from './user';
import { relations } from 'drizzle-orm';

export const FriendTable = pgTable('friend', {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  totalOwed: real('total_owed').notNull().default(0),
  avatar: varchar('avatar', { length: 255 }),
  userId: uuid().references(() => UserTable.id, { onDelete: 'cascade' }),
  ...dateMixin
});

export const friendRelations = relations(FriendTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [FriendTable.userId],
    references: [UserTable.id]
  })
}));

export type Friend = typeof FriendTable.$inferSelect;
export type NewFriend = typeof FriendTable.$inferInsert;
