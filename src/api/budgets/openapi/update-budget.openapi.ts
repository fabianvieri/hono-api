import { createRoute, z } from '@hono/zod-openapi';

import {
	BudgetSelectSchema,
	BudgetUpdateSchema,
} from '@schemas/budgets';

export const UpdateBudgetOpenApi = createRoute({
	method: 'patch',
	tags: ['Budgets'],
	summary: 'Update budget',
	security: [{ Bearer: [] }],
	path: '/:id',
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
							.openapi({ examples: ['Error updating budget'] }),
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
	},
});

