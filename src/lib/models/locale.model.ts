export const LOCALE_VALUES = ['en-US', 'fr-FR', 'it-IT'] as const;

export type Locale = (typeof LOCALE_VALUES)[number];

export const DEFAULT_LOCALE: Locale = 'en-US';

export type TimeUnit = {
	singular: string;
	plural: string;
	short: string;
};

export const TIME_UNITS: {
	[locale in Locale]: {
		year: TimeUnit;
		month: TimeUnit;
		day: TimeUnit;
		hour: TimeUnit;
		minute: TimeUnit;
		second: TimeUnit;
		millisecond: TimeUnit;
	};
} = {
	'en-US': {
		year: {
			singular: 'year',
			plural: 'years',
			short: 'yr',
		},
		month: {
			singular: 'month',
			plural: 'months',
			short: 'mo',
		},
		day: {
			singular: 'day',
			plural: 'days',
			short: 'd',
		},
		hour: {
			singular: 'hour',
			plural: 'hours',
			short: 'h',
		},
		minute: {
			singular: 'minute',
			plural: 'minutes',
			short: 'm',
		},
		second: {
			singular: 'second',
			plural: 'seconds',
			short: 's',
		},
		millisecond: {
			singular: 'millisecond',
			plural: 'milliseconds',
			short: 'ms',
		},
	},
	'fr-FR': {
		year: {
			singular: 'année',
			plural: 'années',
			short: 'an',
		},
		month: {
			singular: 'mois',
			plural: 'mois',
			short: 'mo',
		},
		day: {
			singular: 'jour',
			plural: 'jours',
			short: 'j',
		},
		hour: {
			singular: 'heure',
			plural: 'heures',
			short: 'h',
		},
		minute: {
			singular: 'minute',
			plural: 'minutes',
			short: 'min',
		},
		second: {
			singular: 'seconde',
			plural: 'secondes',
			short: 's',
		},
		millisecond: {
			singular: 'milliseconde',
			plural: 'millisecondes',
			short: 'ms',
		},
	},
	'it-IT': {
		year: {
			singular: 'anno',
			plural: 'anni',
			short: 'a',
		},
		month: {
			singular: 'mese',
			plural: 'mesi',
			short: 'm',
		},
		day: {
			singular: 'giorno',
			plural: 'giorni',
			short: 'g',
		},
		hour: {
			singular: 'ora',
			plural: 'ore',
			short: 'o',
		},
		minute: {
			singular: 'minuto',
			plural: 'minuti',
			short: 'min',
		},
		second: {
			singular: 'secondo',
			plural: 'secondi',
			short: 's',
		},
		millisecond: {
			singular: 'millisecondo',
			plural: 'millisecondi',
			short: 'ms',
		},
	},
};
