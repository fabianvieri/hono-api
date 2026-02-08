import { sql } from 'drizzle-orm';
import { integer, text } from 'drizzle-orm/sqlite-core';

export const baseColumns = {
	id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text('updated_at')
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
};
