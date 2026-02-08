import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { baseColumns } from './base';

export const users = sqliteTable(
	'users',
	{
		...baseColumns,
		password: text('password').notNull(),
		email: text('email').notNull().unique(),
		username: text('username').notNull().unique(),
	},
	(table) => [index('email_idx').on(table.email)],
);

export const UserSelectSchema = createSelectSchema(users);
export const UserInsertSchema = createInsertSchema(users);
export const UserUpdateSchema = UserInsertSchema.partial();
export const UserPublicSchema = UserSelectSchema.omit({ password: true });
export const UserSignInSchema = UserInsertSchema.pick({
	email: true,
	password: true,
});
export const UserSignUpSchema = UserInsertSchema.pick({
	email: true,
	username: true,
	password: true,
});
