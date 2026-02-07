import { createRoute, z } from '@hono/zod-openapi';
import { UserSignInSchema } from '../../schemas/users';

export const SignInOpenApi = createRoute({
	method: 'post',
	tags: ['Users'],
	path: '/sign-in',
	summary: 'Sign In User',
	request: {
		body: {
			content: {
				'application/json': {
					schema: UserSignInSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Successful sign-in',
			content: {
				'application/json': { schema: z.object({ token: z.string() }) },
			},
		},
		400: {
			description: 'Bad Request',
			content: {
				'application/json': {
					schema: z.object({
						message: z
							.string()
							.openapi({ examples: ['Invalid email or password'] }),
					}),
				},
			},
		},
	},
});
