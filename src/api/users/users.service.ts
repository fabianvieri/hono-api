import { DrizzleD1Database } from 'drizzle-orm/d1';
import { md5 } from 'hono/utils/crypto';
import { users } from '../../schemas/users';
import { eq, and } from 'drizzle-orm';
import { sign } from 'hono/jwt';

export class UserService {
	private static instance: UserService;

	constructor(
		private readonly db: DrizzleD1Database<Record<string, never>>,
		private readonly jwtSecret: string,
	) {}

	public static getInstance(
		db: DrizzleD1Database<Record<string, never>>,
		jwtSecret: string,
	) {
		if (!this.instance) this.instance = new UserService(db, jwtSecret);
		return this.instance;
	}

	public async signIn(data: { email: string; password: string }) {
		const { email, password } = data;

		const hashedPassword = await md5(password);

		if (!hashedPassword) {
			throw new Error('Error hashing user password');
		}

		const user = await this.db
			.select()
			.from(users)
			.where(and(eq(users.email, email), eq(users.password, hashedPassword)))
			.get();

		if (!user) {
			throw new Error('Invalid credentials');
		}

		const token = await sign({ id: user.id }, this.jwtSecret);
		return { token };
	}

	public async signUp(data: {
		email: string;
		password: string;
		username: string;
	}) {
		const { email, password, username } = data;

		const user = await this.db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.get();

		if (user) {
			throw new Error('Email already exists');
		}

		const hashedPassword = await md5(password);

		if (!hashedPassword) {
			throw new Error('Error hashing user password');
		}

		const newUser = await this.db
			.insert(users)
			.values({ email, password: hashedPassword, username })
			.returning({ id: users.id })
			.get();

		return newUser.id;
	}

	public async profile(data: { id: number }) {
		const { id } = data;

		console.log('id', id);

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
			throw new Error('User not found');
		}

		return user;
	}
}
