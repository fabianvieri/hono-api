import { OpenAPIHono } from '@hono/zod-openapi';
import { Bindings, Variables } from '../../core/configs/worker';
import { UserService } from './users.service';
import { SigninOpenApi } from './openapi/signin.openapi';
import { SignupOpenAPI } from './openapi/singup.openapi';
import { ProfileOpenAPI } from './openapi/profile.openapi';
import { auth } from '../../core/middlewares/auth';

const routes = new OpenAPIHono<{
	Bindings: Bindings;
	Variables: Variables & { userService: UserService };
}>();

routes.use(async (c, next) => {
	const userService = UserService.getInstance(c.var.db, c.env.JWT_SECRET);
	c.set('userService', userService);
	await next();
});

routes.openapi(SigninOpenApi, async (c) => {
	try {
		const service = c.get('userService');
		const { email, password } = c.req.valid('json');
		const { token } = await service.signIn({ email, password });
		return c.json({ token }, 200);
	} catch (error) {
		return c.json({ message: 'Invalid email or password' }, 400);
	}
});

routes.openapi(SignupOpenAPI, async (c) => {
	try {
		const service = c.get('userService');
		const { email, password, username } = c.req.valid('json');
		const id = await service.signUp({ email, password, username });
		return c.json({ id }, 200);
	} catch (error) {
		return c.json({ message: 'Email already exists' }, 400);
	}
});

routes.use(ProfileOpenAPI.getRoutingPath(), auth);
routes.openapi(ProfileOpenAPI, async (c) => {
	try {
		const service = c.get('userService');
		const userId = c.var.jwtPayload.id;
		const userProfile = await service.profile({ id: userId });
		return c.json(userProfile, 200);
	} catch (error) {
		return c.json({ message: 'User not found' }, 400);
	}
});

export { routes as UserRoutes };
