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
				'application/json': { schema: UserSignInSchema },
			},
		},
	},
	responses: {
		200: {
			description: 'Signin successful',
			content: {
				'application/json': {
					schema: z.object({
						ok: z.boolean(),
						data: z.object({ exp: z.number() }),
						message: z.null(),
					}),
				},
			},
		},
		401: {
			description: 'Unauthorized',
			content: {
				'application/json': {
					schema: z.object({
						ok: z.boolean(),
						data: z.null(),
						message: z.string().openapi({ examples: ['Invalid credentials'] }),
					}),
				},
			},
		},
	},
});
