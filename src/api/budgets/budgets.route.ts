import { OpenAPIHono } from '@hono/zod-openapi';
import { Bindings, Variables } from '../../core/configs/worker';
import { BudgetService } from './budgets.service';
import { UserBudgetsOpenApi } from './openapi/user-budgets.openapi';
import { auth } from '../../core/middlewares/auth';
import { CreateBudgetOpenApi } from './openapi/create-budget.openapi';

const routes = new OpenAPIHono<{
	Bindings: Bindings;
	Variables: Variables & { budgetService: BudgetService };
}>();

routes.use(async (c, next) => {
	const budgetService = BudgetService.getInstance(c.var.db);
	c.set('budgetService', budgetService);
	await next();
});

routes.use(UserBudgetsOpenApi.getRoutingPath(), auth);
routes.openapi(UserBudgetsOpenApi, async (c) => {
	const service = c.get('budgetService');
	const userId = c.var.jwtPayload.id;
	const budgets = await service.getBudgetsByUserId(userId);
	return c.json({ ok: true, data: budgets, message: null }, 200);
});

routes.use(CreateBudgetOpenApi.getRoutingPath(), auth);
routes.openapi(CreateBudgetOpenApi, async (c) => {
	const service = c.get('budgetService');
	const body = c.req.valid('json');
	const userId = c.var.jwtPayload.id;
	const budgets = await service.createBudget(body, userId);
	return c.json({ ok: true, data: budgets, message: null }, 200);
});

export { routes as BudgetRoutes };
