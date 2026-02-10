import { Context, Next } from 'hono';
import { decode, verify } from 'hono/jwt';
import { z } from '@hono/zod-openapi';
import { getCookie } from 'hono/cookie';
import { Bindings, Variables } from '../configs/worker';

export const auth = async (
	ctx: Context<{ Bindings: Bindings; Variables: Variables }>,
	next: Next,
) => {
	const cookieToken = getCookie(ctx, 'auth_token');
	const token = cookieToken;

	if (!token) {
		return ctx.json({ message: 'Unauthorized' }, 401);
	}

	try {
		await verify(token, ctx.env.JWT_SECRET, 'HS256');
	} catch {
		ctx.header('WWW-Authenticate', 'Bearer');
		return ctx.json({ message: 'Unauthorized' }, 401);
	}

	const { payload } = decode(token);
	const payloadSchema = z.object({
		id: z.string(),
		iat: z.number(),
		exp: z.number(),
	});

	const parsedPayload = payloadSchema.safeParse(payload);
	if (!parsedPayload.success) {
		return ctx.json({ message: 'Unauthorized' }, 401);
	}

	const now = Math.floor(Date.now() / 1000);
	if (parsedPayload.data.exp <= now) {
		return ctx.json({ message: 'Unauthorized' }, 401);
	}

	ctx.set('jwtPayload', parsedPayload.data);

	await next();
};
