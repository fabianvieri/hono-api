import { OpenAPIHono } from '@hono/zod-openapi';
import { Bindings, Variables } from '../../core/configs/worker';
import { BudgetService } from './budgets.service';
import { UserBudgetsOpenApi } from './budgets.openapi';
import { auth } from '../../core/middlewares/auth';

const routes = new OpenAPIHono<{
	Bindings: Bindings;
	Variables: Variables & { budgetService: BudgetService };
}>();

routes.use(async (c, next) => {
	const budgetService = BudgetService.getInstance(c.var.db);
	c.set('budgetService', budgetService);
	await next();
});

// routes.use(UserBudgetsOpenApi.getRoutingPath(), auth);
routes.openapi(UserBudgetsOpenApi, async (c) => {
	const { userId } = c.req.valid('param');
	const service = c.get('budgetService');
	const budgets = await service.getBudgetsByUserId(userId);

	return c.json(budgets, 200);
});

export { routes as BudgetRoutes };
