import { DrizzleD1Database } from 'drizzle-orm/d1';
import {
	BudgetInsertSchema,
	budgets,
	BudgetUpdateSchema,
} from '../../schemas/budgets';
import { eq } from 'drizzle-orm';
import { AppError } from '../../core/errors/app-error';
import { z } from '@hono/zod-openapi';

export class BudgetService {
	private static instance: BudgetService;

	constructor(private readonly db: DrizzleD1Database<Record<string, never>>) {}

	public static getInstance(db: DrizzleD1Database<Record<string, never>>) {
		if (!this.instance) this.instance = new BudgetService(db);
		return this.instance;
	}

	public async createBudget(
		budget: z.infer<typeof BudgetInsertSchema>,
		userId: string,
	) {
		const output = await this.db
			.insert(budgets)
			.values({ ...budget, userId })
			.returning()
			.get();

		return output;
	}

	public async updateBudget(
		budget: z.infer<typeof BudgetUpdateSchema>,
		budgetId: string,
	) {
		const output = await this.db
			.update(budgets)
			.set({ ...budget })
			.where(eq(budgets.id, budgetId))
			.returning()
			.get();

		return output;
	}

	public async deleteBudget(budgetId: string) {
		const output = await this.db
			.delete(budgets)
			.where(eq(budgets.id, budgetId))
			.returning()
			.get();

		return output;
	}

	public async getBudgetsByUserId(userId: string) {
		const output = await this.db
			.select()
			.from(budgets)
			.where(eq(budgets.userId, userId));

		return output;
	}
}
