import { describe, expect, it } from 'vitest';
import i18n, { changeActiveLocale, getActiveLocale } from './i18n';

describe('i18n', () => {
	it('initializes translations with expected languages and fallback', () => {
		expect(i18n.isInitialized).toBe(true);
		expect(i18n.options.fallbackLng).toEqual(['en-US']);
		expect(i18n.options.supportedLngs).toEqual(
			expect.arrayContaining(['en-US', 'fr-FR', 'it-IT'])
		);
		expect(i18n.hasResourceBundle('en-US', 'translation')).toBe(true);
		expect(i18n.hasResourceBundle('fr-FR', 'translation')).toBe(true);
		expect(i18n.hasResourceBundle('it-IT', 'translation')).toBe(true);
	});

	it('exposes the active language as a canonical full locale tag', async () => {
		await i18n.changeLanguage('fr-FR');
		expect(getActiveLocale()).toBe('fr-FR');
		await i18n.changeLanguage('en-US');
	});

	it('changes the active language through the locale API', async () => {
		await changeActiveLocale('it-IT');

		expect(i18n.resolvedLanguage).toBe('it-IT');
		expect(getActiveLocale()).toBe('it-IT');

		await changeActiveLocale('en-US');
	});
});
