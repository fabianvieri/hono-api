import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	driver: 'd1-http',
	dialect: 'sqlite',
	schema: ['./src/schemas/auth.ts', './src/schemas/budgets.ts', './src/schemas/expenses.ts'],
	out: './drizzle',
});
