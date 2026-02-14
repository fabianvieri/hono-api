import { createRoute, z } from '@hono/zod-openapi';

import { BudgetCreateSchema, BudgetSelectSchema } from '@schemas/budgets';

export const CreateBudgetOpenApi = createRoute({
	method: 'post',
	tags: ['Budgets'],
	summary: 'Create budget',
	security: [{ Bearer: [] }],
	path: '/',
	request: {
		body: {
			content: {
				'application/json': { schema: BudgetCreateSchema },
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
							data: BudgetSelectSchema,
							message: z.null(),
						})
						.openapi({
							examples: [
								{
									ok: true,
									data: {
										id: 'some-random-id',
										userId: 'some-random-id',
										amount: 1000,
										name: 'Test Budget',
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
							.openapi({ examples: ['Error creating budget'] }),
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
