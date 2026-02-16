import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';

import { BudgetRoutes } from '@api/budgets/budgets.route';
import { ExpenseRoutes } from '@api/expenses/expenses.route';
import { createBetterAuth, parseTrustedOrigins } from '@core/auth/better-auth';
import { DrizzleDB } from '@core/db/drizzle';
import { RedisUpstash } from '@core/db/redis';
import { AppError } from '@core/errors/app-error';
import { limiter } from '@core/middlewares/limiter';

import type { Variables } from '@core/configs/worker';

type AppEnv = { Bindings: CloudflareBindings; Variables: Variables };
type App = OpenAPIHono<AppEnv>;

const registerOpenAPI = (app: App) => {
	app.openAPIRegistry.registerComponent('securitySchemes', 'CookieAuth', {
		type: 'apiKey',
		in: 'cookie',
		name: 'better-auth.session_token',
	});

	app.doc31('/openapi', {
		info: { title: 'Hono API', version: '1.0' },
		openapi: '3.1.0',
	});

	app.get('/swagger', swaggerUI({ url: '/openapi', withCredentials: true }));
};

const registerErrorHandler = (app: App) => {
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
};

const registerMiddlewares = (app: App) => {
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

	app.use(
		cors({
			origin: (requestOrigin, c) => {
				const allowedOrigins = parseTrustedOrigins(
					c.env.BETTER_AUTH_TRUSTED_ORIGINS,
				);

				if (!requestOrigin) return allowedOrigins[0] ?? '';
				return allowedOrigins.includes(requestOrigin) ? requestOrigin : '';
			},
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
};

const registerRoutes = (app: App) => {
	app.get('/', (c) => c.text('Welcome to this server'));
	app.on(['GET', 'POST'], '/api/auth/*', async (c) => {
		const auth = createBetterAuth(c.var.db, c.env);
		return auth.handler(c.req.raw);
	});
	app.route('/api/budgets', BudgetRoutes);
	app.route('/api/expenses', ExpenseRoutes);
};

export const createApp = () => {
	const app = new OpenAPIHono<AppEnv>();

	registerOpenAPI(app);
	registerErrorHandler(app);
	registerMiddlewares(app);
	registerRoutes(app);

	return app;
};
