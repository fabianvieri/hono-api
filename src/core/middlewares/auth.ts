import { Context, Next } from 'hono';
import { decode, verify } from 'hono/jwt';
import { z } from '@hono/zod-openapi';
import { Bindings, Variables } from '../configs/worker';

export const auth = async (
	ctx: Context<{ Bindings: Bindings; Variables: Variables }>,
	next: Next,
) => {
	const authorization = ctx.req.header('Authorization');
	const [scheme, token] = authorization?.split(' ') ?? [];

	if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
		ctx.header('WWW-Authenticate', 'Bearer');
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
		id: z.union([z.string(), z.number()]).transform((value) => String(value)),
	});

	const parsedPayload = payloadSchema.safeParse(payload);

	if (!parsedPayload.success) {
		ctx.header('WWW-Authenticate', 'Bearer');
		return ctx.json({ message: 'Unauthorized' }, 401);
	}

	ctx.set('jwtPayload', parsedPayload.data);

	await next();
};
