import { eq } from 'drizzle-orm';
import { sign } from 'hono/jwt';

import { hashPassword, verifyPassword } from '@api/users/utils/password';
import { AppError } from '@core/errors/app-error';
import { users } from '@schemas/users';


import type { z } from '@hono/zod-openapi';
import type { UserSignInSchema, UserSignUpSchema } from '@schemas/users';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export class UserService {
	private static instance: UserService;

	constructor(
		private readonly db: DrizzleD1Database<Record<string, never>>,
		private readonly jwtSecret: string,
		private readonly jwtTtlSeconds: number,
	) {}

	public static getInstance(
		db: DrizzleD1Database<Record<string, never>>,
		jwtSecret: string,
		jwtTtlSeconds: number,
	) {
		if (!this.instance)
			this.instance = new UserService(db, jwtSecret, jwtTtlSeconds);
		return this.instance;
	}

	public async signIn(data: z.infer<typeof UserSignInSchema>) {
		const { email, password } = data;

		const user = await this.db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.get();

		if (!user) {
			throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
		}

		const isValid = verifyPassword(password, user.password);
		if (!isValid) {
			throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
		}

		const now = Math.floor(Date.now() / 1000);
		const exp = now + this.jwtTtlSeconds;
		const token = await sign({ id: user.id, iat: now, exp }, this.jwtSecret);

		return { token, exp };
	}

	public async signUp(data: z.infer<typeof UserSignUpSchema>) {
		const { email, password, username } = data;

		const user = await this.db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.get();

		if (user) {
			throw new AppError(409, 'EMAIL_EXISTS', 'Email already exists');
		}

		const hashedPassword = hashPassword(password);

		const newUser = await this.db
			.insert(users)
			.values({ email, password: hashedPassword, username })
			.returning({ id: users.id })
			.get();

		return newUser.id;
	}

	public async profile(id: string) {
		const user = await this.db
			.select({
				id: users.id,
				email: users.email,
				username: users.username,
				createdAt: users.createdAt,
				updatedAt: users.updatedAt,
			})
			.from(users)
			.where(eq(users.id, id))
			.get();

		if (!user) {
			throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
		}

		return user;
	}
}

