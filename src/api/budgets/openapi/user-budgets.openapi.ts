import { createRoute, z } from '@hono/zod-openapi';
import { BudgetSelectSchema } from '../../../schemas/budgets';

export const UserBudgetsOpenApi = createRoute({
	method: 'get',
	tags: ['Budgets'],
	summary: 'Get User Budgets',
	security: [{ Bearer: [] }],
	path: '/{userId}',
	request: {
		params: z.object({
			userId: z.coerce.number().openapi({ example: 1 }),
		}),
	},
	responses: {
		200: {
			description: 'Success',
			content: {
				'application/json': {
					schema: BudgetSelectSchema.openapi({
						examples: [
							{
								id: 1,
								userId: 5,
								amount: 1000,
								name: 'Test Budget',
								createdAt: '2026-02-07 13:47:16',
								updatedAt: '2026-02-07 13:47:16',
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
						message: z.string().openapi({ examples: ['Unauthorized'] }),
					}),
				},
			},
		},
	},
});
