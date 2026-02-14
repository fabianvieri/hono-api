import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: [
			'node_modules/**',
			'.wrangler/**',
			'dist/**',
			'coverage/**',
			'drizzle/**',
			'eslint.config.js',
		],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	{
		files: ['**/*.ts'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.es2024,
				...globals.serviceworker,
			},
		},
		settings: {
			'import/resolver': {
				typescript: true,
				node: true,
			},
		},
		rules: {
			'no-console': 'off',
			'@typescript-eslint/consistent-type-imports': [
				'warn',
				{ prefer: 'type-imports' },
			],
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'import/order': [
				'warn',
				{
					'alphabetize': { order: 'asc', caseInsensitive: true },
					'newlines-between': 'always',
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
						'type',
					],
				},
			],
		},
	},
	eslintConfigPrettier,
);
