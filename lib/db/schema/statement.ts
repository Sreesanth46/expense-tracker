import {
  pgTable,
  real,
  boolean,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { CreditCardTable } from './card';
import { dateMixin } from './mixin';
import { relations } from 'drizzle-orm';

export const CardStatementTable = pgTable('card_statement', {
  id: uuid().primaryKey().defaultRandom(),
  creditCardId: uuid('credit_card_id')
    .references(() => CreditCardTable.id, {
      onDelete: 'cascade'
    })
    .notNull(),
  month: varchar('month', { length: 50 }).notNull(),
  year: real('year').notNull(),
  statementPdfUrl: varchar('statement_pdf_url', { length: 255 }),
  totalDue: real('total_due').notNull().default(0),
  amountPaid: real('paid').notNull().default(0),
  dueDate: timestamp('due_date').notNull(),
  isPaid: boolean('is_paid').notNull().default(false),
  ...dateMixin
});

export const cardStatementRelations = relations(
  CardStatementTable,
  ({ one }) => ({
    creditCard: one(CreditCardTable, {
      fields: [CardStatementTable.creditCardId],
      references: [CreditCardTable.id]
    })
  })
);

export type CardStatement = typeof CardStatementTable.$inferSelect;
export type NewCardStatement = typeof CardStatementTable.$inferInsert;
