import { describe, expect, it } from 'vitest';
import { PROFILE_VISIBILITY_VALUES } from '@/lib/models';
import i18n from './i18n';

const SUPPORTED_LANGUAGES = ['en', 'it', 'fr'] as const;

const expectNonEmptyString = (value: unknown) => {
	expect(value).toEqual(expect.any(String));
	if (typeof value === 'string') {
		expect(value.trim()).not.toBe('');
	}
};

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

	it.each(
		SUPPORTED_LANGUAGES
	)('contains complete profile visibility copy for %s', (language) => {
		for (const visibility of PROFILE_VISIBILITY_VALUES) {
			const label = i18n.getResource(
				language,
				'translation',
				`ProfileVisibilitySelect.${visibility}`
			);
			const description = i18n.getResource(
				language,
				'translation',
				`ProfileVisibilitySelect.descriptions.${visibility}`
			);

			expectNonEmptyString(label);
			expectNonEmptyString(description);
		}
	});
});
