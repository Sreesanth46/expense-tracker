import { transactionCategoryValues } from '@/constants';
import {
  pgTable,
  real,
  boolean,
  jsonb,
  uuid,
  varchar,
  pgEnum
} from 'drizzle-orm/pg-core';
import { CreditCardTable } from './card';
import { dateMixin } from './mixin';
import { relations } from 'drizzle-orm';

export const transactionCategoryEnum = pgEnum(
  'category',
  transactionCategoryValues
);

export const TransactionTable = pgTable('transaction', {
  id: uuid().primaryKey().defaultRandom(),
  description: varchar('description', { length: 255 }).notNull(),
  amount: real('amount').notNull(),
  creditCardId: uuid('credit_card_id').references(() => CreditCardTable.id, {
    onDelete: 'cascade'
  }),
  category: transactionCategoryEnum(),
  isEMI: boolean('is_emi').notNull().default(false),
  emiDetails: jsonb('emi_details').$type<{
    totalAmount: number;
    monthlyAmount: number;
    months: number;
    isNoCost: boolean;
  }>(),
  tax: real('tax').default(0),
  interest: real('interest').default(0),
  ...dateMixin
});

export const transactionRelations = relations(TransactionTable, ({ one }) => ({
  creditCard: one(CreditCardTable, {
    fields: [TransactionTable.creditCardId],
    references: [CreditCardTable.id]
  })
}));

export type Transaction = typeof TransactionTable.$inferSelect;
export type NewTransaction = typeof TransactionTable.$inferInsert;
