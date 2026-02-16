import { OpenAPIHono } from '@hono/zod-openapi';
import { setCookie } from 'hono/cookie';

import { ProfileOpenAPI } from '@api/users/openapi/profile.openapi';
import { SigninOpenApi } from '@api/users/openapi/signin.openapi';
import { SignupOpenAPI } from '@api/users/openapi/singup.openapi';
import { UserService } from '@api/users/users.service';
import { auth } from '@core/middlewares/auth';

import type { Variables } from '@core/configs/worker';

const routes = new OpenAPIHono<{
	Bindings: CloudflareBindings;
	Variables: Variables & { userService: UserService };
}>();

routes.use(async (c, next) => {
	const ttlSeconds = Number(c.env.BETTER_AUTH_SESSION_TTL_SECONDS);
	if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
		throw new Error('Invalid BETTER_AUTH_SESSION_TTL_SECONDS');
	}
	const userService = UserService.getInstance(
		c.var.db,
		c.env.BETTER_AUTH_SECRET,
		ttlSeconds,
	);
	c.set('userService', userService);
	await next();
});

routes.openapi(SigninOpenApi, async (c) => {
	const service = c.get('userService');
	const body = c.req.valid('json');
	const { token, exp } = await service.signIn(body);
	const isHttps = new URL(c.req.url).protocol === 'https:';
	setCookie(c, 'auth_token', token, {
		httpOnly: true,
		secure: isHttps,
		sameSite: isHttps ? 'None' : 'Lax',
		path: '/',
		maxAge: Number(c.env.BETTER_AUTH_SESSION_TTL_SECONDS),
	});
	return c.json({ ok: true, data: { exp }, message: null }, 200);
});

routes.openapi(SignupOpenAPI, async (c) => {
	const service = c.get('userService');
	const body = c.req.valid('json');
	const id = await service.signUp(body);
	return c.json({ ok: true, data: { id }, message: null }, 200);
});

routes.use(ProfileOpenAPI.getRoutingPath(), auth);
routes.openapi(ProfileOpenAPI, async (c) => {
	const service = c.get('userService');
	const userId = c.var.jwtPayload.id;
	const userProfile = await service.profile(userId);
	return c.json({ ok: true, data: userProfile, message: null }, 200);
});

export { routes as UserRoutes };
