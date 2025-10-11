import { dateMixin } from './mixin';
import { UserTable } from './user';
import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core';

export const UserAuthTable = pgTable('user_auth', {
  userId: uuid('user_id')
    .references(() => UserTable.id, { onDelete: 'cascade' })
    .primaryKey(),
  password: varchar('password', { length: 255 }).notNull(),
  ...dateMixin
});

export type UserAuth = typeof UserAuthTable.$inferSelect;
export type NewUserAuth = typeof UserAuthTable.$inferInsert;
