import { createRoute, z } from '@hono/zod-openapi';
import { UserSignUpSchema } from '../../../schemas/users';

export const SignupOpenAPI = createRoute({
	method: 'post',
	tags: ['Users'],
	summary: 'Signup new user',
	path: '/sign-up',
	request: {
		body: {
			content: {
				'application/json': { schema: UserSignUpSchema },
			},
		},
	},
	responses: {
		200: {
			description: 'Success',
			content: {
				'application/json': {
					schema: z.object({
						id: z.string(),
					}),
				},
			},
		},
		400: {
			description: 'Bad request',
			content: {
				'application/json': {
					schema: z.object({
						message: z.string().openapi({ examples: ['Invalid credentials'] }),
					}),
				},
			},
		},
	},
});
