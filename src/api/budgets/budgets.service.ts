import { DrizzleD1Database } from 'drizzle-orm/d1';
import { budgets } from '../../schemas/budgets';

export class BudgetService {
	private static instance: BudgetService;

	constructor(private readonly db: DrizzleD1Database<Record<string, never>>) {}

	public static getInstance(db: DrizzleD1Database<Record<string, never>>) {
		if (!this.instance) this.instance = new BudgetService(db);
		return this.instance;
	}

	public async getData() {
		const result = await this.db.select().from(budgets);
		return result;
	}
}
