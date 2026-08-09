import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LOCALE_VALUES } from '@/lib/models';
import { normalizeLocale, resolveSupportedLocale } from './locale-utils';

describe('locale normalization', () => {
	it('defines the backend-supported full locale tags', () => {
		expect(LOCALE_VALUES).toEqual(['en-US', 'fr-FR', 'it-IT']);
		expect(DEFAULT_LOCALE).toBe('en-US');
	});

	it.each([
		['en-US', 'en-US'],
		['fr-fr', 'fr-FR'],
		['it_IT', 'it-IT'],
		['en', 'en-US'],
		['fr', 'fr-FR'],
		['it', 'it-IT'],
		['fr-CA', 'fr-FR'],
		['en-GB', 'en-US'],
	])('normalizes %s to %s', (input, expected) => {
		expect(normalizeLocale(input)).toBe(expected);
	});

	it('uses the supplied fallback for missing and unsupported values', () => {
		expect(normalizeLocale(undefined, 'it-IT')).toBe('it-IT');
		expect(normalizeLocale('de-DE', 'fr-FR')).toBe('fr-FR');
	});

	it('returns null when a locale cannot be resolved', () => {
		expect(resolveSupportedLocale('de-DE')).toBeNull();
		expect(resolveSupportedLocale(null)).toBeNull();
	});
});
