import { OpenAPIHono } from '@hono/zod-openapi';

import { BudgetService } from '@api/budgets/budgets.service';
import { CreateBudgetOpenApi } from '@api/budgets/openapi/create-budget.openapi';
import { DeleteBudgetOpenApi } from '@api/budgets/openapi/delete-budget.openapi';
import { UpdateBudgetOpenApi } from '@api/budgets/openapi/update-budget.openapi';
import { UserBudgetsOpenApi } from '@api/budgets/openapi/user-budgets.openapi';
import { ExpenseService } from '@api/expenses/expenses.service';
import { BudgetExpensesOpenApi } from '@api/expenses/openapi/budget-expenses.openapi';
import { auth } from '@core/middlewares/auth';

import type { Variables } from '@core/configs/worker';

const routes = new OpenAPIHono<{
	Bindings: CloudflareBindings;
	Variables: Variables & {
		authUser: { id: string };
		budgetService: BudgetService;
		expenseService: ExpenseService;
	};
}>();

routes.use(async (c, next) => {
	const db = c.var.db;
	const budgetService = BudgetService.getInstance(db);
	const expenseService = ExpenseService.getInstance(db);
	c.set('budgetService', budgetService);
	c.set('expenseService', expenseService);
	await next();
});

routes.use('*', auth);

// get all user budgets
routes.openapi(UserBudgetsOpenApi, async (c) => {
	const service = c.get('budgetService');
	const userId = c.var.authUser.id;
	const budgets = await service.getBudgetsByUserId(userId);
	return c.json({ ok: true, data: budgets, message: null }, 200);
});

// create budget
routes.openapi(CreateBudgetOpenApi, async (c) => {
	const service = c.get('budgetService');
	const body = c.req.valid('json');
	const userId = c.var.authUser.id;
	const budget = await service.createBudget(body, userId);
	return c.json({ ok: true, data: budget, message: null }, 201);
});

// update budget
routes.openapi(UpdateBudgetOpenApi, async (c) => {
	const service = c.get('budgetService');
	const body = c.req.valid('json');
	const userId = c.var.authUser.id;
	const { id: budgetId } = c.req.valid('param');
	const budget = await service.updateBudget(body, budgetId, userId);
	return c.json({ ok: true, data: budget, message: null }, 200);
});

// delete budget
routes.openapi(DeleteBudgetOpenApi, async (c) => {
	const service = c.get('budgetService');
	const userId = c.var.authUser.id;
	const { id: budgetId } = c.req.valid('param');
	const budget = await service.deleteBudget(budgetId, userId);
	return c.json({ ok: true, data: budget, message: null }, 200);
});

// get all expenses from budget
routes.openapi(BudgetExpensesOpenApi, async (c) => {
	const expenseService = c.get('expenseService');
	const userId = c.var.authUser.id;
	const { budgetId } = c.req.valid('param');
	const expenses = await expenseService.getExpensesByBudgetId(budgetId, userId);
	return c.json({ ok: true, data: expenses, message: null }, 200);
});

export { routes as BudgetRoutes };
