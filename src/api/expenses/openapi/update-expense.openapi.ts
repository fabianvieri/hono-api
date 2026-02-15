import { createRoute, z } from '@hono/zod-openapi';

import { ExpenseSelectSchema, ExpenseUpdateSchema } from '@schemas/expenses';

export const UpdateExpenseOpenApi = createRoute({
	method: 'patch',
	tags: ['Expenses'],
	summary: 'Update expense',
	security: [{ CookieAuth: [] }],
	path: '/{id}',
	request: {
		params: z.object({
			id: z.string().openapi({
				param: {
					name: 'id',
					in: 'path',
				},
				example: 'some-random-id',
			}),
		}),
		body: {
			content: {
				'application/json': { schema: ExpenseUpdateSchema },
			},
		},
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
		400: {
			description: 'Bad Request',
			content: {
				'application/json': {
					schema: z.object({
						ok: z.literal(false),
						data: z.null(),
						message: z
							.string()
							.openapi({ examples: ['Error updating expense'] }),
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
