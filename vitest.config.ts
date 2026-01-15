import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

const getIncludePattern = () => {
	const testType = process.env.VITEST_TEST_TYPE || 'all';
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
			'@features': path.resolve(__dirname, './src/features'),
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
			include: ['src/features/movie/components/MovieLogItem.tsx'],
			exclude: [
				'**/*.{unit.test,integration.test,spec}.{ts,tsx}',
				'**/node_modules/**',
				'**/dist/**',
				'**/*.d.ts',
			],
			reportsDirectory: './coverage',
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80,
			},
		},
	},
});
