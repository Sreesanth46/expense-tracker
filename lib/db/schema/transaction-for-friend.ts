import { pgTable, real, boolean, uuid } from 'drizzle-orm/pg-core';
import { TransactionTable } from './transaction';
import { FriendTable } from './friend';
import { dateMixin } from './mixin';
import { relations } from 'drizzle-orm';

export const TransactionForFriendTable = pgTable('transaction_for_friend', {
  id: uuid().primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').references(() => TransactionTable.id, {
    onDelete: 'cascade'
  }),
  friendId: uuid('friend_id').references(() => FriendTable.id, {
    onDelete: 'cascade'
  }),
  isSettled: boolean('is_settled').notNull().default(false),
  settledAmount: real('settled_amount').notNull().default(0),
  ...dateMixin
});

export const transactionForFriendRelations = relations(
  TransactionForFriendTable,
  ({ one }) => ({
    transaction: one(TransactionTable, {
      fields: [TransactionForFriendTable.transactionId],
      references: [TransactionTable.id]
    }),
    friend: one(FriendTable, {
      fields: [TransactionForFriendTable.friendId],
      references: [FriendTable.id]
    })
  })
);

export type TransactionForFriend =
  typeof TransactionForFriendTable.$inferSelect;
export type NewTransactionForFriend =
  typeof TransactionForFriendTable.$inferInsert;
