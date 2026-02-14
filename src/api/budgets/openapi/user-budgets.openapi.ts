import { createRoute, z } from '@hono/zod-openapi';

import { BudgetSelectSchema } from '@schemas/budgets';

export const UserBudgetsOpenApi = createRoute({
	method: 'get',
	tags: ['Budgets'],
	summary: 'Get user budgets',
	security: [{ Bearer: [] }],
	path: '/',
	responses: {
		200: {
			description: 'Success',
			content: {
				'application/json': {
					schema: z
						.object({
							ok: z.literal(true),
							data: z.array(BudgetSelectSchema),
							message: z.null(),
						})
						.openapi({
							examples: [
								{
									ok: true,
									data: [
										{
											id: 'some-random-id',
											userId: 'some-random-id',
											amount: 1000,
											name: 'Test Budget',
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

