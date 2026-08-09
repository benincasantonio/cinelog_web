import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import {
	DEFAULT_LOCALE,
	LOCALE_VALUES,
	type Locale,
} from '@/lib/models/locale.model';
import { normalizeLocale } from '@/lib/utilities/locale-utils';
// Import translation files
import en from './en.json';
import fr from './fr.json';
import it from './it.json';

const resources = {
	'en-US': {
		translation: en,
	},
	'fr-FR': {
		translation: fr,
	},
	'it-IT': {
		translation: it,
	},
};

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: DEFAULT_LOCALE,
		supportedLngs: LOCALE_VALUES,
		load: 'currentOnly',
		interpolation: {
			escapeValue: false,
		},
		react: {
			useSuspense: false,
		},
		detection: {
			order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
			caches: ['localStorage'],
			convertDetectedLanguage: (language) => normalizeLocale(language),
		},
	});

export const getActiveLocale = (): Locale =>
	normalizeLocale(i18n.resolvedLanguage ?? i18n.language);

export const changeActiveLocale = async (locale: Locale): Promise<void> => {
	await i18n.changeLanguage(locale);
};

export default i18n;
