import { createRoute, z } from '@hono/zod-openapi';

import { ExpenseSelectSchema } from '@schemas/expenses';

export const UserExpensesByBudgetIdOpenApi = createRoute({
	method: 'get',
	tags: ['Expenses'],
	summary: 'Get expenses by budget ID',
	security: [{ Bearer: [] }],
	path: '/budget/:budgetId',
	request: {
		params: z.object({
			budgetId: z.string().openapi({
				param: {
					name: 'budgetId',
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
							data: z.array(ExpenseSelectSchema),
							message: z.null(),
						})
						.openapi({
							examples: [
								{
									ok: true,
									data: [
										{
											id: 'clx0d0d0d0d0d0d0d0d0d0d0',
											budgetId: 'clx0d0d0d0d0d0d0d0d0d0d0',
											name: 'Groceries',
											amount: 5000,
											createdAt: '2026-02-07 13:47:16',
											updatedAt: '2026-02-07 13:47:16',
										},
									],
									message: null,
								},
							],
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
							.openapi({ examples: ['Budget not found or does not belong to the user'] }),
					}),
				},
			},
		},
	},
});

export const GetExpenseByIdOpenApi = createRoute({
	method: 'get',
	tags: ['Expenses'],
	summary: 'Get expense by ID',
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
