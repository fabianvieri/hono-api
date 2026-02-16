import type { Redis } from '@upstash/redis';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export type Variables = {
	redis: Redis;
	db: DrizzleD1Database<Record<string, never>>;
	authUser?: { id: string };
};
