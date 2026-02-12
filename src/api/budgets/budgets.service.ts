import { DrizzleD1Database } from 'drizzle-orm/d1';
import { budgets } from '../../schemas/budgets';
import { eq } from 'drizzle-orm';
import { AppError } from '../../core/errors/app-error';

export class BudgetService {
	private static instance: BudgetService;

	constructor(private readonly db: DrizzleD1Database<Record<string, never>>) {}

	public static getInstance(db: DrizzleD1Database<Record<string, never>>) {
		if (!this.instance) this.instance = new BudgetService(db);
		return this.instance;
	}

	public async getBudgetsByUserId(userId: string) {
		const rows = await this.db
			.select()
			.from(budgets)
			.where(eq(budgets.userId, userId));
		if (rows.length === 0) {
			throw new AppError(404, 'BUDGETS_NOT_FOUND', 'Budgets not found');
		}
		return rows;
	}
}
