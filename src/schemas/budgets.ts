import { sql } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const budgets = sqliteTable('budgets', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	title: text('title', { length: 256 }).notNull(),
	content: text('content', { length: 256 }).notNull(),
	timestamp: text('timestamp')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const BudgetSelectSchema = createSelectSchema(budgets);
