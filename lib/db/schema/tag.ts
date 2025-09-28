import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { UserTable } from './user';
import { relations } from 'drizzle-orm';

export const TagTable = pgTable('tag', {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(),
  color: varchar('color', { length: 20 }),
  description: varchar('description', { length: 255 }),
  createdBy: uuid('created_by')
    .references(() => UserTable.id, {
      onDelete: 'cascade'
    })
    .notNull()
});

export const tagRelations = relations(TagTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [TagTable.createdBy],
    references: [UserTable.id]
  })
}));

export type Tag = typeof TagTable.$inferSelect;
export type NewTag = typeof TagTable.$inferInsert;
