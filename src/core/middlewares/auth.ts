import { createBetterAuth } from '@core/auth/better-auth';

import type { Variables } from '@core/configs/worker';
import type { Context, Next } from 'hono';

export const auth = async (
	ctx: Context<{ Bindings: CloudflareBindings; Variables: Variables }>,
	next: Next,
) => {
	const betterAuth = createBetterAuth(ctx.var.db, ctx.env);
	const session = await betterAuth.api.getSession({
		headers: ctx.req.raw.headers,
	});
	if (!session) {
		return ctx.json({ ok: false, data: null, message: 'Unauthorized' }, 401);
	}

	ctx.set('authUser', {
		id: session.user.id,
	});

	await next();
};
