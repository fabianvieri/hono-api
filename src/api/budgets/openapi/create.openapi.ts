import { createRoute, z } from '@hono/zod-openapi';

export const CreateBudget = createRoute({
	method: 'get',
	tags: ['Budgets'],
	operationId: 'create',
	summary: 'create test',
	path: '/',
	responses: {
		200: {
			description: 'Success',
			content: { 'application/json': { schema: z.string() } },
		},
	},
});
