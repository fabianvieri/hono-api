import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { Bindings, Variables } from './core/configs/worker';
import { DrizzleDB } from './core/db/drizzle';
import { BudgetRoutes } from './api/budgets/budgets.route';
import { UserRoutes } from './api/users/users.route';

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>();

app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
	type: 'http',
	scheme: 'bearer',
	bearerFormat: 'JWT',
});

app.doc31('/openapi', {
	info: { title: 'Hono API', version: '1.0' },
	openapi: '3.1.0',
});

app.get('/', (c) => c.text(`Welcome to this server`));
app.get('/swagger', swaggerUI({ url: '/openapi' }));

app.use(async (ctx, next) => {
	ctx.set('db', DrizzleDB.getInstance(ctx.env.DB));
	await next();
});

app.route('/api/users', UserRoutes);
app.route('/api/budgets', BudgetRoutes);

export default app;
