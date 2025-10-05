import { pgTable, real, unique, uuid, varchar } from 'drizzle-orm/pg-core';
import { dateMixin } from './mixin';
import { UserTable } from './user';
import { relations } from 'drizzle-orm';

export const FriendTable = pgTable(
  'friend',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).unique(),
    totalOwed: real('total_owed').notNull().default(0),
    avatar: varchar('avatar', { length: 255 }),
    // who created this friend entry
    friendUserId: uuid()
      .references(() => UserTable.id, { onDelete: 'cascade' })
      .notNull(),
    // if this is a user in the system, this will point to that user
    userId: uuid().references(() => UserTable.id, { onDelete: 'no action' }),
    ...dateMixin
  },
  table => [unique('uniqueFriendPerUser').on(table.friendUserId, table.email)]
);

export const friendRelations = relations(FriendTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [FriendTable.userId],
    references: [UserTable.id]
  }),
  friend: one(UserTable, {
    fields: [FriendTable.friendUserId],
    references: [UserTable.id]
  })
}));

export type Friend = typeof FriendTable.$inferSelect;
export type NewFriend = typeof FriendTable.$inferInsert;
