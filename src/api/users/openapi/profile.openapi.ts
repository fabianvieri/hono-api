import { createRoute, z } from '@hono/zod-openapi';
import { UserPublicSchema } from '../../../schemas/users';

export const ProfileOpenAPI = createRoute({
	method: 'get',
	tags: ['Users'],
	summary: 'Profile',
	security: [{ Bearer: [] }],
	path: '/profile',
	responses: {
		200: {
			description: 'Success',
			content: {
				'application/json': {
					schema: UserPublicSchema.openapi({
						examples: [
							{
								id: 3,
								email: 'test@gmail.com',
								username: 'test',
								createdAt: '2026-02-08 12:19:41',
								updatedAt: '2026-02-08 12:19:41',
							},
						],
					}),
				},
			},
		},
		400: {
			description: 'Not Found',
			content: {
				'application/json': {
					schema: z.object({
						message: z.string().openapi({ examples: ['User not found'] }),
					}),
				},
			},
		},
		401: {
			description: 'Unauthorized',
			content: {
				'application/json': {
					schema: z.object({
						message: z.string().openapi({ examples: ['Unauthorized'] }),
					}),
				},
			},
		},
	},
});
