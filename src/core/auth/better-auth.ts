import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import type { DrizzleD1Database } from 'drizzle-orm/d1';

const parseTrustedOrigins = (origins?: string) => {
	if (!origins) return [];
	return origins
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean);
};

export const createBetterAuth = (
	db: DrizzleD1Database<Record<string, never>>,
	env: CloudflareBindings,
) => {
	const socialProviders = {
		...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
			? {
					github: {
						clientId: env.GITHUB_CLIENT_ID,
						clientSecret: env.GITHUB_CLIENT_SECRET,
					},
				}
			: {}),
	};

	return betterAuth({
		basePath: '/api/auth',
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: parseTrustedOrigins(env.BETTER_AUTH_TRUSTED_ORIGINS),
		database: drizzleAdapter(db, {
			provider: 'sqlite',
			usePlural: true,
		}),
		socialProviders,
	});
};
