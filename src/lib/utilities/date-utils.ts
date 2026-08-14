import { TIME_UNITS } from '../models/locale.model';
import { normalizeLocale } from './locale-utils';

const MINS_PER_HOUR = 60;
const MINS_PER_DAY = 1440;
const MINS_PER_MONTH = 43800;
const MINS_PER_YEAR = 525600;

function getTimeUnitsShort(locale: string): {
	year: string;
	month: string;
	day: string;
	hour: string;
	minute: string;
} {
	const validLocale = normalizeLocale(locale);

	const yearLocale = TIME_UNITS[validLocale].year.short;
	const monthLocale = TIME_UNITS[validLocale].month.short;
	const dayLocale = TIME_UNITS[validLocale].day.short;
	const hourLocale = TIME_UNITS[validLocale].hour.short;
	const minuteLocale = TIME_UNITS[validLocale].minute.short;

	return {
		year: yearLocale,
		month: monthLocale,
		day: dayLocale,
		hour: hourLocale,
		minute: minuteLocale,
	};
}

export const convertMinutesToTime = (
	minutes: number
): {
	years: number;
	months: number;
	days: number;
	hours: number;
	minutes: number;
} => {
	if (minutes < 0) {
		throw new Error('Minutes cannot be negative');
	}

	if (minutes === 0) {
		return {
			years: 0,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
		};
	}

	const years = Math.floor(minutes / MINS_PER_YEAR);
	const remainderAfterYears = minutes % MINS_PER_YEAR;

	const months = Math.floor(remainderAfterYears / MINS_PER_MONTH);
	const remainderAfterMonths = remainderAfterYears % MINS_PER_MONTH;

	const days = Math.floor(remainderAfterMonths / MINS_PER_DAY);
	const remainderAfterDays = remainderAfterMonths % MINS_PER_DAY;

	const hours = Math.floor(remainderAfterDays / MINS_PER_HOUR);
	const minutesLeft = remainderAfterDays % MINS_PER_HOUR;

	return {
		years,
		months,
		days,
		hours,
		minutes: minutesLeft,
	};
};

export const humanizeMinutes = (minutes: number, locale: string): string => {
	const {
		year: yearShort,
		month: monthShort,
		day: dayShort,
		hour: hourShort,
		minute: minuteShort,
	} = getTimeUnitsShort(locale);

	if (minutes === 0) return `0${minuteShort}`;

	const {
		years,
		months,
		days,
		hours,
		minutes: calculatedMinutes,
	} = convertMinutesToTime(minutes);

	let humanizedValue = '';

	if (years > 0) {
		humanizedValue += `${years}${yearShort} `;
	}

	if (months > 0) {
		humanizedValue += `${months}${monthShort} `;
	}

	if (days > 0) {
		humanizedValue += `${days}${dayShort} `;
	}

	if (hours > 0) {
		humanizedValue += `${hours}${hourShort} `;
	}

	if (calculatedMinutes > 0) {
		humanizedValue += `${calculatedMinutes}${minuteShort}`;
	}

	return humanizedValue.trim();
};

const RELATIVE_TIME_IN_SECONDS = {
	minute: 60,
	hour: 60 * 60,
	day: 60 * 60 * 24,
	month: 60 * 60 * 24 * 30,
	year: 60 * 60 * 24 * 365,
} as const;

export const formatRelativeTime = (
	iso: string,
	locale: string,
	now: number = Date.now()
): string => {
	const then = new Date(iso).getTime();
	if (Number.isNaN(then)) return iso;

	const diffSeconds = Math.round((then - now) / 1000);
	const abs = Math.abs(diffSeconds);
	const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

	if (abs < RELATIVE_TIME_IN_SECONDS.minute) {
		return formatter.format(diffSeconds, 'second');
	}
	if (abs < RELATIVE_TIME_IN_SECONDS.hour) {
		return formatter.format(
			Math.round(diffSeconds / RELATIVE_TIME_IN_SECONDS.minute),
			'minute'
		);
	}
	if (abs < RELATIVE_TIME_IN_SECONDS.day) {
		return formatter.format(
			Math.round(diffSeconds / RELATIVE_TIME_IN_SECONDS.hour),
			'hour'
		);
	}
	if (abs < RELATIVE_TIME_IN_SECONDS.month) {
		return formatter.format(
			Math.round(diffSeconds / RELATIVE_TIME_IN_SECONDS.day),
			'day'
		);
	}
	if (abs < RELATIVE_TIME_IN_SECONDS.year) {
		return formatter.format(
			Math.round(diffSeconds / RELATIVE_TIME_IN_SECONDS.month),
			'month'
		);
	}
	return formatter.format(
		Math.round(diffSeconds / RELATIVE_TIME_IN_SECONDS.year),
		'year'
	);
};
