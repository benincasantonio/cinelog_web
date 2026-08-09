import {
	DEFAULT_LOCALE,
	LOCALE_VALUES,
	type Locale,
} from '@/lib/models/locale.model';

const LOCALES_BY_TAG = new Map(
	LOCALE_VALUES.map((locale) => [locale.toLowerCase(), locale])
);

const LOCALES_BY_LANGUAGE = new Map(
	LOCALE_VALUES.map((locale) => [locale.split('-', 1)[0].toLowerCase(), locale])
);

export const resolveSupportedLocale = (value: unknown): Locale | null => {
	if (typeof value !== 'string') return null;

	const normalized = value.trim().replaceAll('_', '-').toLowerCase();
	if (!normalized) return null;

	const exactLocale = LOCALES_BY_TAG.get(normalized);
	if (exactLocale) return exactLocale;

	const language = normalized.split('-', 1)[0];
	return LOCALES_BY_LANGUAGE.get(language) ?? null;
};

export const normalizeLocale = (
	value: unknown,
	fallback: Locale = DEFAULT_LOCALE
): Locale => resolveSupportedLocale(value) ?? fallback;
