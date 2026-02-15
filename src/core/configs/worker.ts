import type { Redis } from '@upstash/redis';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export type Bindings = {
	DB: D1Database;
	JWT_SECRET: string;
	JWT_TTL_SECONDS: string;
	UPSTASH_REDIS_REST_URL: string;
	UPSTASH_REDIS_REST_TOKEN: string;
};

export type Variables = {
	redis: Redis;
	db: DrizzleD1Database<Record<string, never>>;
	jwtPayload?: { id: string; iat: number; exp: number };
};
