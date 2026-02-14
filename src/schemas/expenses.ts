import { createSelectSchema } from 'drizzle-zod';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { budgets } from './budgets';
import { baseColumns } from './base';
import { createInsertSchema } from 'drizzle-zod';

export const expenses = sqliteTable(
	'expenses',
	{
		...baseColumns,
		name: text('name').notNull(),
		amount: integer('amount').notNull(),
		budgetId: text('budget_id')
			.notNull()
			.references(() => budgets.id, { onDelete: 'cascade' }),
	},
	(table) => [index('budget_id_idx').on(table.budgetId)],
);

export const ExpenseSelectSchema = createSelectSchema(expenses);
export const ExpenseInsertSchema = createInsertSchema(expenses);
export const ExpenseUpdateSchema = ExpenseInsertSchema.partial();
