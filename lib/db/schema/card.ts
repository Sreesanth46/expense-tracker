import { pgTable, real, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { dateMixin } from './mixin';
import { UserTable } from './user';
import { relations } from 'drizzle-orm';

export const CreditCardTable = pgTable('credit_card', {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  lastFourDigits: varchar('last_four_digits', { length: 4 }).notNull(),
  bank: varchar('bank', { length: 255 }).notNull(),
  currentBalance: real('current_balance').notNull().default(0),
  dueDate: timestamp('due_date'),
  userId: uuid().references(() => UserTable.id, { onDelete: 'cascade' }),
  ...dateMixin
});

export const creditCardRelations = relations(CreditCardTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [CreditCardTable.userId],
    references: [UserTable.id]
  })
}));

export type CreditCard = typeof CreditCardTable.$inferSelect;
export type NewCreditCard = typeof CreditCardTable.$inferInsert;
