import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';

import { BudgetRoutes } from '@api/budgets/budgets.route';
import { ExpenseRoutes } from '@api/expenses/expenses.route';
import { UserRoutes } from '@api/users/users.route';
import { DrizzleDB } from '@core/db/drizzle';
import { RedisUpstash } from '@core/db/redis';
import { AppError } from '@core/errors/app-error';
import { limiter } from '@core/middlewares/limiter';

import type { Bindings, Variables } from '@core/configs/worker';

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>();

app.openAPIRegistry.registerComponent('securitySchemes', 'CookieAuth', {
	type: 'apiKey',
	in: 'cookie',
	name: 'auth_token',
});

app.use(async (c, next) => {
	c.set(
		'redis',
		RedisUpstash.getInstance(
			c.env.UPSTASH_REDIS_REST_URL,
			c.env.UPSTASH_REDIS_REST_TOKEN,
		),
	);
	await next();
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
app.get('/swagger', swaggerUI({ url: '/openapi', withCredentials: true }));

app.use(
	cors({
		origin: '*',
		credentials: true,
	}),
);

app.use(secureHeaders());
app.use(logger());

app.use('/api/*', async (c, next) => {
	const applyLimiter = limiter(c.var.redis);
	return applyLimiter(c, next);
});

app.use(async (c, next) => {
	c.set('db', DrizzleDB.getInstance(c.env.DB));
	await next();
});

app.route('/api/users', UserRoutes);
app.route('/api/budgets', BudgetRoutes);
app.route('/api/expenses', ExpenseRoutes);

export default app;
