import { describe, expect, it } from 'vitest';
import i18n from './i18n';

describe('i18n', () => {
	it('initializes translations with expected languages and fallback', () => {
		expect(i18n.isInitialized).toBe(true);
		expect(i18n.options.fallbackLng).toEqual(['en']);
		expect(i18n.options.supportedLngs).toEqual(
			expect.arrayContaining(['en', 'fr', 'it'])
		);
		expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
		expect(i18n.hasResourceBundle('fr', 'translation')).toBe(true);
		expect(i18n.hasResourceBundle('it', 'translation')).toBe(true);
	});
});
