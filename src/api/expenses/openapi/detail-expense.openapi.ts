import { createRoute, z } from '@hono/zod-openapi';

import { ExpenseSelectSchema } from '@schemas/expenses';

export const DetailExpenseOpenApi = createRoute({
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
				example: 'some-random-id',
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
							ok: z.literal(true),
							data: ExpenseSelectSchema,
							message: z.null(),
						})
						.openapi({
							examples: [
								{
									ok: true,
									data: {
										id: 'some-random-id',
										budgetId: 'some-random-id',
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
						ok: z.literal(false),
						data: z.null(),
						message: z.string().openapi({
							examples: ['Expense not found or does not belong to the user'],
						}),
					}),
				},
			},
		},
		401: {
			description: 'Unauthorized',
			content: {
				'application/json': {
					schema: z.object({
						ok: z.literal(false),
						data: z.null(),
						message: z.string().openapi({ examples: ['Unauthorized'] }),
					}),
				},
			},
		},
	},
});
