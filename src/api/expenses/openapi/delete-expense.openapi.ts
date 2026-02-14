import { createRoute, z } from '@hono/zod-openapi';

import { ExpenseSelectSchema } from '@schemas/expenses';

export const DeleteExpenseOpenApi = createRoute({
	method: 'delete',
	tags: ['Expenses'],
	summary: 'Delete expense',
	security: [{ Bearer: [] }],
	path: '/:expenseId',
	request: {
		params: z.object({
			expenseId: z.string().openapi({
				param: {
					name: 'expenseId',
					in: 'path',
				},
				example: 'clx0d0d0d0d0d0d0d0d0d0d0',
			}),
		}),
	},
	responses: {
		200: {
			description: 'Success',
			content: {
				'application/json': {
					schema: z
						.object({
							ok: z.boolean(),
							data: ExpenseSelectSchema,
							message: z.null(),
						})
						.openapi({
							examples: [
								{
									ok: true,
									data: {
										id: 'clx0d0d0d0d0d0d0d0d0d0d0',
										budgetId: 'clx0d0d0d0d0d0d0d0d0d0d0',
										name: 'Groceries',
										amount: 5000,
										createdAt: '2026-02-07 13:47:16',
										updatedAt: '2026-02-07 13:47:16',
									},
									message: null,
								},
							],
						}),
				},
			},
		},
		400: {
			description: 'Bad Request',
			content: {
				'application/json': {
					schema: z.object({
						ok: z.boolean(),
						data: z.null(),
						message: z
							.string()
							.openapi({ examples: ['Error deleting expense'] }),
					}),
				},
			},
		},
		404: {
			description: 'Not Found',
			content: {
				'application/json': {
					schema: z.object({
						ok: z.boolean(),
						data: z.null(),
						message: z
							.string()
							.openapi({ examples: ['Expense not found or does not belong to the user'] }),
					}),
				},
			},
			},
	},
});
