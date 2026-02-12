import { OpenAPIHono } from '@hono/zod-openapi';
import { Bindings, Variables } from '../../core/configs/worker';
import { UserService } from './users.service';
import { SigninOpenApi } from './openapi/signin.openapi';
import { SignupOpenAPI } from './openapi/singup.openapi';
import { ProfileOpenAPI } from './openapi/profile.openapi';
import { auth } from '../../core/middlewares/auth';
import { setCookie } from 'hono/cookie';

const routes = new OpenAPIHono<{
	Bindings: Bindings;
	Variables: Variables & { userService: UserService };
}>();

routes.use(async (c, next) => {
	const ttlSeconds = Number(c.env.JWT_TTL_SECONDS);
	if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
		throw new Error('Invalid JWT_TTL_SECONDS');
	}
	const userService = UserService.getInstance(
		c.var.db,
		c.env.JWT_SECRET,
		ttlSeconds,
	);
	c.set('userService', userService);
	await next();
});

routes.openapi(SigninOpenApi, async (c) => {
	const service = c.get('userService');
	const { email, password } = c.req.valid('json');
	const { token, exp } = await service.signIn({ email, password });
	setCookie(c, 'auth_token', token, {
		httpOnly: true,
		secure: true,
		sameSite: 'None',
		path: '/',
		maxAge: Number(c.env.JWT_TTL_SECONDS),
	});
	return c.json({ ok: true, data: { exp }, message: null }, 200);
});

routes.openapi(SignupOpenAPI, async (c) => {
	const service = c.get('userService');
	const { email, password, username } = c.req.valid('json');
	const id = await service.signUp({ email, password, username });
	return c.json({ ok: true, data: { id }, message: null }, 200);
});

routes.use(ProfileOpenAPI.getRoutingPath(), auth);
routes.openapi(ProfileOpenAPI, async (c) => {
	const service = c.get('userService');
	const userId = c.var.jwtPayload.id;
	const userProfile = await service.profile({ id: userId });
	return c.json({ ok: true, data: userProfile, message: null }, 200);
});

export { routes as UserRoutes };
