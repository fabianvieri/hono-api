import { createSelectSchema } from 'drizzle-zod';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { baseColumns } from './base';
import { createInsertSchema } from 'drizzle-zod';

export const budgets = sqliteTable(
	'budgets',
	{
		...baseColumns,
		name: text('name').notNull(),
		amount: integer('amount').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
	},
	(table) => [index('user_id_idx').on(table.userId)],
);

export const BudgetSelectSchema = createSelectSchema(budgets);
export const BudgetInsertSchema = createInsertSchema(budgets);
