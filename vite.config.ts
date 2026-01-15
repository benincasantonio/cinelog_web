import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const vendorChunks: Record<string, string[]> = {
	'vendor-react': ['react', 'react-dom', 'react-router-dom'],
	'vendor-firebase': [
		'firebase/app',
		'firebase/auth',
		'firebase/analytics',
		'@firebase',
	],
	'vendor-recharts': ['recharts', 'd3'],
	'vendor-i18n': [
		'i18next',
		'react-i18next',
		'i18next-browser-languagedetector',
	],
	'vendor-ui': ['@antoniobenincasa/ui'],
	'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
};

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@features': path.resolve(__dirname, './src/features'),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id: string) {
					if (id.includes('node_modules')) {
						for (const [chunkName, packages] of Object.entries(vendorChunks)) {
							if (packages.some((pkg) => id.includes(`node_modules/${pkg}`))) {
								return chunkName;
							}
						}
					}
				},
			},
		},
	},
});
