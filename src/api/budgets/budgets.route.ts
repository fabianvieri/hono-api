import { OpenAPIHono } from '@hono/zod-openapi';
import { Bindings, Variables } from '../../core/configs/worker';

import { BudgetService } from './budgets.service';
import { GetBudgets } from './budgets.openapi';

const routes = new OpenAPIHono<{
	Bindings: Bindings;
	Variables: Variables & { budgetService: BudgetService };
}>();

routes.use(async (ctx, next) => {
	const budgetService = BudgetService.getInstance(ctx.var.db);
	ctx.set('budgetService', budgetService);
	await next();
});

routes.openapi(GetBudgets, async (c) => {
	const service = c.get('budgetService');
	const budgets = await service.getData();

	return c.json(budgets);
});

export { routes as BudgetRoutes };
