import { sql } from 'drizzle-orm';
import { integer, text } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const baseColumns = {
	id: text()
		.primaryKey()
		.notNull()
		.$defaultFn(() => createId()),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text('updated_at')
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
};
