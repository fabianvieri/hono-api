import { DrizzleD1Database } from 'drizzle-orm/d1';
import { users } from '../../schemas/users';
import { eq } from 'drizzle-orm';
import { sign } from 'hono/jwt';
import { hashPassword, verifyPassword } from './utils/password';

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

	public async signIn(data: { email: string; password: string }) {
		const { email, password } = data;

		const user = await this.db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.get();

		if (!user) throw new Error('Invalid credentials');

		const isValid = await verifyPassword(password, user.password);
		if (!isValid) throw new Error('Invalid credentials');

		const now = Math.floor(Date.now() / 1000);
		const exp = now + this.jwtTtlSeconds;
		const token = await sign({ id: user.id, iat: now, exp }, this.jwtSecret);
		return { token, exp };
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

		const hashedPassword = await hashPassword(password);

		const newUser = await this.db
			.insert(users)
			.values({ email, password: hashedPassword, username })
			.returning({ id: users.id })
			.get();

		return newUser.id;
	}

	public async profile(data: { id: string }) {
		const { id } = data;

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
