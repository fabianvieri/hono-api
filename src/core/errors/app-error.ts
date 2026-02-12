import { ContentfulStatusCode } from 'hono/utils/http-status';

export class AppError extends Error {
	public readonly status: ContentfulStatusCode;
	public readonly code: string;

	constructor(status: ContentfulStatusCode, code: string, message: string) {
		super(message);
		this.status = status;
		this.code = code;
	}
}
