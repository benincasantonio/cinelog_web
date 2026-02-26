import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

const testType = process.env.VITEST_TEST_TYPE || 'all';

const getIncludePattern = () => {
	switch (testType) {
		case 'unit':
			return ['**/*.unit.test.{ts,tsx}'];
		case 'integration':
			return ['**/*.integration.test.{ts,tsx}'];
		default:
			return ['**/*.{unit.test,integration.test}.{ts,tsx}'];
	}
};

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		include: getIncludePattern(),
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			include: ['src/**/*.{ts,tsx}'],
			exclude: [
				'**/*.{unit.test,integration.test,spec}.{ts,tsx}',
				'**/node_modules/**',
				'**/dist/**',
				'**/*.d.ts',
				'**/models/**',
				'**/index.ts',
				'**/schemas/**',
				'**/*.test-*.{ts,tsx}',
				'**/test/**',
				'src/main.tsx',
				'src/vite-env.d.ts',
			],
			reportsDirectory: './coverage',
			thresholds:
				testType !== 'integration'
					? {
							lines: 80,
							functions: 80,
							branches: 80,
							statements: 80,
						}
					: undefined,
		},
	},
});
