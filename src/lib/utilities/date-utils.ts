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
	const validLocale = (
		Object.hasOwn(timeUnits, locale) ? locale : 'en'
	) as keyof typeof timeUnits;

	const yearLocale = timeUnits[validLocale].year.short;
	const monthLocale = timeUnits[validLocale].month.short;
	const dayLocale = timeUnits[validLocale].day.short;
	const hourLocale = timeUnits[validLocale].hour.short;
	const minuteLocale = timeUnits[validLocale].minute.short;

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
