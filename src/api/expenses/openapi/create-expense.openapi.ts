import { createRoute, z } from '@hono/zod-openapi';

import { ExpenseCreateSchema, ExpenseSelectSchema } from '@schemas/expenses';

const ExpenseCreateRequestSchema = ExpenseCreateSchema.extend({
	budgetId: z.string().openapi({
		example: 'some-random-id',
		description: 'The ID of the budget this expense belongs to.',
	}),
});

export const CreateExpenseOpenApi = createRoute({
	method: 'post',
	tags: ['Expenses'],
	summary: 'Create expense',
	security: [{ Bearer: [] }],
	path: '/',
	request: {
		body: {
			content: {
				'application/json': {
					schema: ExpenseCreateRequestSchema,
				},
			},
		},
	},
	responses: {
		201: {
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
							.openapi({ examples: ['Error creating expense'] }),
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
							examples: ['Budget not found or does not belong to the user'],
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
