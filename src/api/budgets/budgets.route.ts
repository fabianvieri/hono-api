import { OpenAPIHono } from '@hono/zod-openapi';

import { auth } from '../../core/middlewares/auth';

import { BudgetService } from './budgets.service';
import { CreateBudgetOpenApi } from './openapi/create-budget.openapi';
import { DeleteBudgetOpenApi } from './openapi/delete-budget.openapi';
import { UpdateBudgetOpenApi } from './openapi/update-budget.openapi';
import { UserBudgetsOpenApi } from './openapi/user-budgets.openapi';

import type { Bindings, Variables } from '../../core/configs/worker';

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
	const budget = await service.createBudget(body, userId);
	return c.json({ ok: true, data: budget, message: null }, 201);
});

routes.use(UpdateBudgetOpenApi.getRoutingPath(), auth);
routes.openapi(UpdateBudgetOpenApi, async (c) => {
	const service = c.get('budgetService');
	const body = c.req.valid('json');
	const userId = c.var.jwtPayload.id;
	const { id: budgetId } = c.req.valid('param');
	const budget = await service.updateBudget(body, budgetId, userId);
	return c.json({ ok: true, data: budget, message: null }, 200);
});

routes.use(DeleteBudgetOpenApi.getRoutingPath(), auth);
routes.openapi(DeleteBudgetOpenApi, async (c) => {
	const service = c.get('budgetService');
	const userId = c.var.jwtPayload.id;
	const { id: budgetId } = c.req.valid('param');
	const budget = await service.deleteBudget(budgetId, userId);
	return c.json({ ok: true, data: budget, message: null }, 200);
});

export { routes as BudgetRoutes };
