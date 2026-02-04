import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { Bindings, Variables } from './core/configs/worker';
import { DrizzleDB } from './core/configs/db/drizzle';
import { BudgetRoutes } from './api/budgets/budgets.route';

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>();

app.doc('/openapi', {
	info: { title: 'Hono API', version: '1.0' },
	openapi: '3.1.0',
});

app.get('/', (c) => c.text(`Welcome to this server`));
app.get('/swagger', swaggerUI({ url: '/openapi' }));

app.use(async (ctx, next) => {
	ctx.set('db', DrizzleDB.getInstance(ctx.env.DB));
	await next();
});

app.route('/api/budgets', BudgetRoutes);

export default app;
