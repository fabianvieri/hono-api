import { createRoute, z } from '@hono/zod-openapi';
import { BudgetSelectSchema } from '../../schemas/budgets';

export const GetBudgets = createRoute({
	method: 'get',
	tags: ['Budgets'],
	operationId: 'get-all',
	summary: 'Get All Budgets',
	path: '/',
	responses: {
		200: {
			description: 'Success',
			content: { 'application/json': { schema: BudgetSelectSchema } },
		},
	},
});
