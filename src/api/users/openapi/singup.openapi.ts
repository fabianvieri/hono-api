import { createRoute, z } from '@hono/zod-openapi';

import { UserSignUpSchema } from '@schemas/users';

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
						ok: false,
						data: z.object({ id: z.string() }),
						message: z.null(),
					}),
				},
			},
		},
		409: {
			description: 'Conflict',
			content: {
				'application/json': {
					schema: z.object({
						ok: false,
						data: z.null(),
						message: z.string().openapi({ examples: ['Email already exists'] }),
					}),
				},
			},
		},
	},
});

