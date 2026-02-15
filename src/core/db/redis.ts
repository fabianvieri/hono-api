import { Redis } from '@upstash/redis';

export class RedisUpstash {
	private static instance?: Redis;

	public static getInstance(url: string, token: string) {
		if (!this.instance) {
			this.instance = new Redis({ url, token });
		}

		return this.instance;
	}
}
