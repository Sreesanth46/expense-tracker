import { pgTable, real, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { dateMixin } from './mixin';
import { UserTable } from './user';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const CreditCardTable = pgTable('credit_card', {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  lastFourDigits: varchar('last_four_digits', { length: 4 }).notNull(),
  bank: varchar('bank', { length: 255 }).notNull(),
  creditLimit: real('credit_limit').notNull().default(0),
  usedLimit: real('used_limit').notNull().default(0),
  dueDate: timestamp('due_date', { mode: 'string' }),
  billingDate: timestamp('billing_date', { mode: 'string' }),
  userId: uuid()
    .references(() => UserTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...dateMixin
});

export const creditCardRelations = relations(CreditCardTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [CreditCardTable.userId],
    references: [UserTable.id]
  })
}));

export const creditCardSchema = createInsertSchema(CreditCardTable, {
  name: schema => schema.min(1, 'Name is required'),
  lastFourDigits: schema =>
    schema.length(4, 'Last four digits must be 4 characters'),
  bank: schema => schema.min(1, 'Bank is required'),
  creditLimit: schema =>
    schema.min(0, 'Credit limit must be non-negative').optional(),
  usedLimit: schema =>
    schema.min(0, 'Used limit must be non-negative').optional(),
  dueDate: schema => schema.optional().nullable(),
  billingDate: schema => schema.optional().nullable()
}).pick({
  name: true,
  lastFourDigits: true,
  bank: true,
  creditLimit: true,
  usedLimit: true,
  dueDate: true,
  billingDate: true
});

export type CreditCardSchema = z.infer<typeof creditCardSchema>;

export type CreditCard = typeof CreditCardTable.$inferSelect;
export type NewCreditCard = typeof CreditCardTable.$inferInsert;
