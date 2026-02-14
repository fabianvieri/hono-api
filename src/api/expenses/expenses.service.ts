import { eq, and } from 'drizzle-orm';

import { AppError } from '@core/errors/app-error';
import { budgets } from '@schemas/budgets';
import {
	expenses,
	type ExpenseCreateSchema,
	type ExpenseUpdateSchema,
} from '@schemas/expenses';

import type { z } from '@hono/zod-openapi';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export class ExpenseService {
	private static instance: ExpenseService;

	constructor(private readonly db: DrizzleD1Database<Record<string, never>>) {}

	public static getInstance(db: DrizzleD1Database<Record<string, never>>) {
		if (!this.instance) this.instance = new ExpenseService(db);
		return this.instance;
	}

	public async createExpense(
		expense: z.infer<typeof ExpenseCreateSchema>,
		userId: string,
	) {
		const budgetExists = await this.db
			.select({ id: budgets.id })
			.from(budgets)
			.where(and(eq(budgets.id, expense.budgetId), eq(budgets.userId, userId)))
			.get();

		if (!budgetExists) {
			throw new AppError(
				404,
				'BUDGET_NOT_FOUND',
				'Budget not found or does not belong to the user',
			);
		}

		const output = await this.db
			.insert(expenses)
			.values({ ...expense })
			.returning()
			.get();

		return output;
	}

	public async updateExpense(
		expense: z.infer<typeof ExpenseUpdateSchema>,
		expenseId: string,
		userId: string,
	) {
		if (Object.keys(expense).length === 0) {
			throw new AppError(400, 'EMPTY_UPDATE_PAYLOAD', 'No fields to update');
		}

		const existingExpense = await this.db
			.select({ id: expenses.id })
			.from(expenses)
			.innerJoin(budgets, eq(expenses.budgetId, budgets.id))
			.where(and(eq(expenses.id, expenseId), eq(budgets.userId, userId)))
			.get();

		if (!existingExpense) {
			throw new AppError(
				404,
				'EXPENSE_NOT_FOUND',
				'Expense not found or does not belong to the user',
			);
		}

		if (expense.budgetId) {
			const budgetExists = await this.db
				.select({ id: budgets.id })
				.from(budgets)
				.where(
					and(eq(budgets.id, expense.budgetId), eq(budgets.userId, userId)),
				)
				.get();

			if (!budgetExists) {
				throw new AppError(
					404,
					'BUDGET_NOT_FOUND',
					'Budget not found or does not belong to the user',
				);
			}
		}

		const output = await this.db
			.update(expenses)
			.set({ ...expense })
			.where(eq(expenses.id, expenseId))
			.returning()
			.get();

		return output;
	}

	public async deleteExpense(expenseId: string, userId: string) {
		const existingExpense = await this.db
			.select({ id: expenses.id })
			.from(expenses)
			.innerJoin(budgets, eq(expenses.budgetId, budgets.id))
			.where(and(eq(expenses.id, expenseId), eq(budgets.userId, userId)))
			.get();

		if (!existingExpense) {
			throw new AppError(
				404,
				'EXPENSE_NOT_FOUND',
				'Expense not found or does not belong to the user',
			);
		}

		const output = await this.db
			.delete(expenses)
			.where(eq(expenses.id, expenseId))
			.returning()
			.get();

		return output;
	}

	public async getExpensesByBudgetId(budgetId: string, userId: string) {
		const budgetExists = await this.db
			.select({ id: budgets.id })
			.from(budgets)
			.where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
			.get();

		if (!budgetExists) {
			throw new AppError(
				404,
				'BUDGET_NOT_FOUND',
				'Budget not found or does not belong to the user',
			);
		}

		const output = await this.db
			.select()
			.from(expenses)
			.where(eq(expenses.budgetId, budgetId));

		return output;
	}

	public async getExpenseById(expenseId: string, userId: string) {
		const output = await this.db
			.select({
				id: expenses.id,
				name: expenses.name,
				amount: expenses.amount,
				budgetId: expenses.budgetId,
				createdAt: expenses.createdAt,
				updatedAt: expenses.updatedAt,
			})
			.from(expenses)
			.innerJoin(budgets, eq(expenses.budgetId, budgets.id))
			.where(and(eq(expenses.id, expenseId), eq(budgets.userId, userId)))
			.get();

		if (!output) {
			throw new AppError(
				404,
				'EXPENSE_NOT_FOUND',
				'Expense not found or does not belong to the user',
			);
		}

		return output;
	}
}
