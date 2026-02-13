import { createRoute, z } from '@hono/zod-openapi';
import {
	BudgetSelectSchema,
	BudgetUpdateSchema,
} from '../../../schemas/budgets';

export const UpdateBudgetOpenApi = createRoute({
	method: 'patch',
	tags: ['Budgets'],
	summary: 'Update budget',
	security: [{ Bearer: [] }],
	path: '/:id',
	request: {
		params: z.object({ id: z.string() }),
		body: {
			content: {
				'application/json': { schema: BudgetUpdateSchema },
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
							ok: false,
							data: BudgetSelectSchema,
							message: z.null(),
						})
						.openapi({
							examples: [
								{
									ok: true,
									data: {
										id: 1,
										userId: 5,
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
						ok: false,
						data: z.null(),
						message: z
							.string()
							.openapi({ examples: ['Error updating budget'] }),
					}),
				},
			},
		},
	},
});
