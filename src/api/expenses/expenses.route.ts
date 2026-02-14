import { OpenAPIHono } from '@hono/zod-openapi';
import { CreateExpenseOpenApi } from './openapi/create-expense.openapi';
import { DeleteExpenseOpenApi } from './openapi/delete-expense.openapi';
import { UpdateExpenseOpenApi } from './openapi/update-expense.openapi';
import {
	UserExpensesByBudgetIdOpenApi,
	GetExpenseByIdOpenApi,
} from './openapi/user-expenses.openapi';
import { ExpenseService } from './expenses.service';
import { auth } from '../../core/middlewares/auth';
import { Bindings, Variables } from '../../core/configs/worker';

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

// Get Expenses by Budget ID
routes.openapi(UserExpensesByBudgetIdOpenApi, async (c) => {
	const expenseService = c.get('expenseService');
	const userId = c.var.jwtPayload.id;
	const { budgetId } = c.req.valid('param');
	const expenses = await expenseService.getExpensesByBudgetId(budgetId, userId);
	return c.json({ ok: true, data: expenses, message: null }, 200);
});

// Get Expense by ID
routes.openapi(GetExpenseByIdOpenApi, async (c) => {
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
