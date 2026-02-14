import { OpenAPIHono } from '@hono/zod-openapi';

import { ExpenseService } from '@api/expenses/expenses.service';
import { CreateExpenseOpenApi } from '@api/expenses/openapi/create-expense.openapi';
import { DeleteExpenseOpenApi } from '@api/expenses/openapi/delete-expense.openapi';
import { DetailExpenseOpenApi } from '@api/expenses/openapi/detail-expense.openapi';
import { UpdateExpenseOpenApi } from '@api/expenses/openapi/update-expense.openapi';
import { auth } from '@core/middlewares/auth';

import type { Bindings, Variables } from '@core/configs/worker';

export const routes = new OpenAPIHono<{
	Bindings: Bindings;
	Variables: Variables & { expenseService: ExpenseService };
}>();

routes.use(async (c, next) => {
	const expenseService = ExpenseService.getInstance(c.var.db);
	c.set('expenseService', expenseService);
	await next();
});

routes.use('*', auth);
routes.openapi(CreateExpenseOpenApi, async (c) => {
	const expenseService = c.get('expenseService');
	const userId = c.var.jwtPayload.id;
	const expense = c.req.valid('json');
	const newExpense = await expenseService.createExpense(expense, userId);
	return c.json({ ok: true, data: newExpense, message: null }, 201);
});

// Get Expense by ID
routes.openapi(DetailExpenseOpenApi, async (c) => {
	const expenseService = c.get('expenseService');
	const userId = c.var.jwtPayload.id;
	const { expenseId } = c.req.valid('param');
	const expense = await expenseService.getExpenseById(expenseId, userId);
	return c.json({ ok: true, data: expense, message: null }, 200);
});

// Update Expense
routes.openapi(UpdateExpenseOpenApi, async (c) => {
	const expenseService = c.get('expenseService');
	const userId = c.var.jwtPayload.id;
	const { expenseId } = c.req.valid('param');
	const expense = c.req.valid('json');
	const updatedExpense = await expenseService.updateExpense(
		expense,
		expenseId,
		userId,
	);
	return c.json({ ok: true, data: updatedExpense, message: null }, 200);
});

// Delete Expense
routes.openapi(DeleteExpenseOpenApi, async (c) => {
	const expenseService = c.get('expenseService');
	const userId = c.var.jwtPayload.id;
	const { expenseId } = c.req.valid('param');
	const deletedExpense = await expenseService.deleteExpense(expenseId, userId);
	return c.json({ ok: true, data: deletedExpense, message: null }, 200);
});

export { routes as ExpenseRoutes };
