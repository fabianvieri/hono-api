import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

import { baseColumns } from '@schemas/base';
import { budgets } from '@schemas/budgets';

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
export const ExpenseCreateSchema = ExpenseInsertSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
export const ExpenseUpdateSchema = ExpenseInsertSchema.partial();
