import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { Bindings, Variables } from './core/configs/worker';
import { DrizzleDB } from './core/db/drizzle';
import { BudgetRoutes } from './api/budgets/budgets.route';
import { UserRoutes } from './api/users/users.route';
import { AppError } from './core/errors/app-error';

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

app.onError((error, c) => {
	if (error instanceof AppError) {
		return c.json(
			{ ok: false, data: null, message: error.message },
			error.status,
		);
	}
	return c.json(
		{ ok: false, data: null, message: 'Internal server error' },
		500,
	);
});

app.get('/', (c) => c.text(`Welcome to this server`));
app.get('/swagger', swaggerUI({ url: '/openapi' }));

app.use(
	cors({
		origin: '*',
		credentials: true,
	}),
);

app.use(secureHeaders());
app.use(logger());

app.use(async (ctx, next) => {
	ctx.set('db', DrizzleDB.getInstance(ctx.env.DB));
	await next();
});

app.route('/api/users', UserRoutes);
app.route('/api/budgets', BudgetRoutes);

export default app;
