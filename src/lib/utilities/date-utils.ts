import { timeUnits } from '../models/locale.model';

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
	locale = Object.hasOwn(timeUnits, locale) ? locale : 'en';

	const yearLocale = timeUnits[locale].year.short;
	const monthLocale = timeUnits[locale].month.short;
	const dayLocale = timeUnits[locale].day.short;
	const hourLocale = timeUnits[locale].hour.short;
	const minuteLocale = timeUnits[locale].minute.short;

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
