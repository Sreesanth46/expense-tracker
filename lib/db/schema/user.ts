import { relations } from 'drizzle-orm';
import { pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { CreditCardTable } from './card';
import { FriendTable } from './friend';
import { dateMixin } from './mixin';
import { TagTable } from './tag';

export const UserTable = pgTable(
  'user',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: varchar('clerk_id', { length: 255 }).unique(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    phone: varchar('phone', { length: 20 }).unique(),
    profileImage: varchar('profile_image', { length: 512 }),
    ...dateMixin
  },
  table => [uniqueIndex('emailIndex').on(table.email)]
);

export const userRelations = relations(UserTable, ({ many }) => ({
  friends: many(FriendTable),
  cards: many(CreditCardTable),
  tags: many(TagTable)
}));

export type User = typeof UserTable.$inferSelect;
export type NewUser = typeof UserTable.$inferInsert;
