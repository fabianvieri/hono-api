import { DrizzleD1Database } from 'drizzle-orm/d1';
import {
	ExpenseInsertSchema,
	expenses,
	ExpenseUpdateSchema,
} from '../../schemas/expenses';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../../core/errors/app-error';
import { z } from '@hono/zod-openapi';
import { budgets } from '../../schemas/budgets';

export class ExpenseService {
	private static instance: ExpenseService;

	constructor(private readonly db: DrizzleD1Database<Record<string, never>>) {}

	public static getInstance(db: DrizzleD1Database<Record<string, never>>) {
		if (!this.instance) this.instance = new ExpenseService(db);
		return this.instance;
	}

	public async createExpense(
		expense: z.infer<typeof ExpenseInsertSchema>,
		userId: string,
	) {
		const {
			id: _ignoredId,
			createdAt: _ignoredCreatedAt,
			updatedAt: _ignoredUpdatedAt,
			...expensePayload
		} = expense;

		const budgetExists = await this.db
			.select({ id: budgets.id })
			.from(budgets)
			.where(
				and(
					eq(budgets.id, expensePayload.budgetId),
					eq(budgets.userId, userId),
				),
			)
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
			.values({ ...expensePayload })
			.returning()
			.get();

		return output;
	}

	public async updateExpense(
		expense: z.infer<typeof ExpenseUpdateSchema>,
		expenseId: string,
		userId: string,
	) {
		const {
			id: _ignoredId,
			createdAt: _ignoredCreatedAt,
			updatedAt: _ignoredUpdatedAt,
			...expensePayload
		} = expense;

		if (Object.keys(expensePayload).length === 0) {
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

		if (expensePayload.budgetId) {
			const budgetExists = await this.db
				.select({ id: budgets.id })
				.from(budgets)
				.where(
					and(
						eq(budgets.id, expensePayload.budgetId),
						eq(budgets.userId, userId),
					),
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
			.set({ ...expensePayload })
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
