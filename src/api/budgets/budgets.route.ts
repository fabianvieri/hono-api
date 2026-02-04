import { OpenAPIHono } from '@hono/zod-openapi';
import { Bindings, Variables } from '../../core/configs/worker';
import { CreateBudget } from './openapi/create.openapi';

const routes = new OpenAPIHono<{
	Bindings: Bindings;
	Variables: Variables;
}>();

routes.openapi(CreateBudget, async (c) => {
	console.log(c.get('db'));

	return c.json('hellow');
});

export { routes as BudgetRoutes };
