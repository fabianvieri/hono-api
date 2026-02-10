import { createRoute, z } from '@hono/zod-openapi';
import { UserSignInSchema } from '../../../schemas/users';

export const SigninOpenApi = createRoute({
	method: 'post',
	tags: ['Users'],
	summary: 'Signin user',
	path: '/sign-in',
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
			description: 'Signin successful',
			content: {
				'application/json': {
					schema: z.object({ exp: z.number() }),
				},
			},
		},
		401: {
			description: 'Unauthorized',
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
