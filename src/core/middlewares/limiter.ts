import { RedisStore } from '@hono-rate-limiter/redis';
import { rateLimiter } from 'hono-rate-limiter';

import type { Bindings, Variables } from '@core/configs/worker';
import type { Redis } from '@upstash/redis';

export const limiter = (redis: Redis) =>
	rateLimiter<{ Bindings: Bindings; Variables: Variables }>({
		windowMs: 15 * 60 * 1000,
		limit: 100,
		standardHeaders: 'draft-6',
		skip: (c) => c.req.method === 'OPTIONS',
		keyGenerator: (c) =>
			c.req.header('cf-connecting-ip') ||
			c.req.header('x-forwarded-for') ||
			c.req.header('x-real-ip') ||
			'anon',
		store: new RedisStore({ client: redis }),
	});
