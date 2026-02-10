import { scrypt } from '@noble/hashes/scrypt';

const SCRYPT_CONFIG = { N: 2 ** 15, r: 8, p: 1, dkLen: 32 };

const toB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));

const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export const hashPassword = (password: string) => {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const hash = scrypt(password, salt, SCRYPT_CONFIG);
	return `scrypt$${toB64(salt)}$${toB64(hash)}`;
};

export const verifyPassword = (password: string, stored: string) => {
	const [alg, saltB64, hashB64] = stored.split('$');
	if (alg !== 'scrypt' || !saltB64 || !hashB64) return false;
	const salt = fromB64(saltB64);
	const hash = fromB64(hashB64);
	const derived = scrypt(password, salt, SCRYPT_CONFIG);
	if (hash.length !== derived.length) return false;
	let diff = 0;
	for (let i = 0; i < hash.length; i += 1) diff |= hash[i] ^ derived[i];
	return diff === 0;
};
