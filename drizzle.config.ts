import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	driver: 'd1-http',
	dialect: 'sqlite',
	schema: './src/schemas/*',
	out: './drizzle',
});
