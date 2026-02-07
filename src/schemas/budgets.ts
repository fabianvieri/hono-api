import { sql, relations } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const budgets = sqliteTable('budgets', {
	id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
	userId: integer('user_id', { mode: 'number' })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	amount: integer('amount').notNull(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text('updated_at')
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const budgetsRelations = relations(budgets, ({ one }) => ({
	user: one(users, {
		fields: [budgets.userId],
		references: [users.id],
	}),
}));

export const BudgetSelectSchema = createSelectSchema(budgets);
