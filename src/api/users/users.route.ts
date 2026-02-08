import { OpenAPIHono } from '@hono/zod-openapi';
import { Bindings, Variables } from '../../core/configs/worker';
import { UserService } from './users.service';
import { SignInOpenApi } from './openapi/signin.openapi';

const routes = new OpenAPIHono<{
	Bindings: Bindings;
	Variables: Variables & { userService: UserService };
}>();

routes.use(async (c, next) => {
	const userService = UserService.getInstance(c.var.db, c.env.JWT_SECRET);
	c.set('userService', userService);
	await next();
});

routes.openapi(SignInOpenApi, async (c) => {
	try {
		const service = c.get('userService');
		const { email, password } = c.req.valid('json');
		const { token } = await service.signIn({ email, password });
		return c.json({ token }, 200);
	} catch (error) {
		return c.json({ message: 'Invalid email or password' }, 400);
	}
});

export { routes as UserRoutes };
