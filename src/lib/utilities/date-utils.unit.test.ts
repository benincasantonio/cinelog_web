import { describe, expect, it } from 'vitest';
import { convertMinutesToTime, humanizeMinutes } from './date-utils';

describe('date-utils', () => {
	describe('convertMinutesToTime', () => {
		it('should throw an error for negative minutes', () => {
			expect(() => convertMinutesToTime(-1)).toThrow(
				'Minutes cannot be negative'
			);
		});

		it('should return all zeros for 0 minutes', () => {
			const result = convertMinutesToTime(0);
			expect(result).toEqual({
				years: 0,
				months: 0,
				days: 0,
				hours: 0,
				minutes: 0,
			});
		});

		it('should convert minutes only', () => {
			const result = convertMinutesToTime(45);
			expect(result).toEqual({
				years: 0,
				months: 0,
				days: 0,
				hours: 0,
				minutes: 45,
			});
		});

		it('should convert hours and minutes', () => {
			const result = convertMinutesToTime(90); // 1 hour 30 minutes
			expect(result).toEqual({
				years: 0,
				months: 0,
				days: 0,
				hours: 1,
				minutes: 30,
			});
		});

		it('should convert days, hours, and minutes', () => {
			const result = convertMinutesToTime(1530); // 1 day, 1 hour, 30 minutes
			expect(result).toEqual({
				years: 0,
				months: 0,
				days: 1,
				hours: 1,
				minutes: 30,
			});
		});

		it('should convert months, days, hours, and minutes', () => {
			// 43800 (1mo) + 1440 (1d) + 60 (1h) + 30 = 45330 minutes
			const result = convertMinutesToTime(45330);
			expect(result).toEqual({
				years: 0,
				months: 1,
				days: 1,
				hours: 1,
				minutes: 30,
			});
		});

		it('should convert years, months, days, hours, and minutes', () => {
			// 525600 (1yr) + 43800 (1mo) + 1440 (1d) + 60 (1h) + 30 = 570930 minutes
			const result = convertMinutesToTime(570930);
			expect(result).toEqual({
				years: 1,
				months: 1,
				days: 1,
				hours: 1,
				minutes: 30,
			});
		});

		it('should handle exact year boundary', () => {
			const result = convertMinutesToTime(525600); // Exactly 1 year
			expect(result).toEqual({
				years: 1,
				months: 0,
				days: 0,
				hours: 0,
				minutes: 0,
			});
		});

		it('should handle exact month boundary', () => {
			// 43800 minutes = exactly 1 month
			const result = convertMinutesToTime(43800);
			expect(result).toEqual({
				years: 0,
				months: 1,
				days: 0,
				hours: 0,
				minutes: 0,
			});
		});

		it('should handle exact day boundary', () => {
			const result = convertMinutesToTime(1440); // Exactly 1 day
			expect(result).toEqual({
				years: 0,
				months: 0,
				days: 1,
				hours: 0,
				minutes: 0,
			});
		});

		it('should handle exact hour boundary', () => {
			const result = convertMinutesToTime(60); // Exactly 1 hour
			expect(result).toEqual({
				years: 0,
				months: 0,
				days: 0,
				hours: 1,
				minutes: 0,
			});
		});
	});

	describe('humanizeMinutes', () => {
		describe('with English locale', () => {
			it('should return "0m" for 0 minutes', () => {
				expect(humanizeMinutes(0, 'en')).toBe('0m');
			});

			it('should humanize minutes only', () => {
				expect(humanizeMinutes(45, 'en')).toBe('45m');
			});

			it('should humanize hours and minutes', () => {
				expect(humanizeMinutes(90, 'en')).toBe('1h 30m');
			});

			it('should humanize days, hours, and minutes', () => {
				expect(humanizeMinutes(1530, 'en')).toBe('1d 1h 30m');
			});

			it('should humanize months, days, hours, and minutes', () => {
				expect(humanizeMinutes(45330, 'en')).toBe('1mo 1d 1h 30m');
			});

			it('should humanize years, months, days, hours, and minutes', () => {
				expect(humanizeMinutes(570930, 'en')).toBe('1yr 1mo 1d 1h 30m');
			});

			it('should omit zero units in the middle', () => {
				expect(humanizeMinutes(525660, 'en')).toBe('1yr 1h'); // 1 year, 0 months, 0 days, 1 hour
			});

			it('should handle exact year boundary', () => {
				expect(humanizeMinutes(525600, 'en')).toBe('1yr');
			});

			it('should handle exact month boundary', () => {
				expect(humanizeMinutes(43800, 'en')).toBe('1mo');
			});

			it('should handle exact day boundary', () => {
				expect(humanizeMinutes(1440, 'en')).toBe('1d');
			});

			it('should handle exact hour boundary', () => {
				expect(humanizeMinutes(60, 'en')).toBe('1h');
			});
		});

		describe('with Italian locale', () => {
			it('should return "0min" for 0 minutes', () => {
				expect(humanizeMinutes(0, 'it')).toBe('0min');
			});

			it('should humanize minutes only', () => {
				expect(humanizeMinutes(45, 'it')).toBe('45min');
			});

			it('should humanize hours and minutes', () => {
				expect(humanizeMinutes(90, 'it')).toBe('1o 30min');
			});

			it('should humanize years with Italian locale', () => {
				expect(humanizeMinutes(525600, 'it')).toBe('1a');
			});
		});

		describe('with French locale', () => {
			it('should return "0min" for 0 minutes', () => {
				expect(humanizeMinutes(0, 'fr')).toBe('0min');
			});

			it('should humanize minutes only', () => {
				expect(humanizeMinutes(45, 'fr')).toBe('45min');
			});

			it('should humanize hours and minutes', () => {
				expect(humanizeMinutes(90, 'fr')).toBe('1h 30min');
			});

			it('should humanize years with French locale', () => {
				expect(humanizeMinutes(525600, 'fr')).toBe('1an');
			});
		});

		describe('with unknown locale', () => {
			it('should fall back to English locale', () => {
				expect(humanizeMinutes(90, 'unknown')).toBe('1h 30m');
			});

			it('should fall back to English for undefined locale', () => {
				expect(humanizeMinutes(60, 'de')).toBe('1h');
			});
		});
	});
});
