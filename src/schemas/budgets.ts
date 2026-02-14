import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

import { baseColumns } from '@schemas/base';
import { users } from '@schemas/users';

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
export const BudgetCreateSchema = BudgetInsertSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	userId: true,
});
export const BudgetUpdateSchema = BudgetCreateSchema.partial();
