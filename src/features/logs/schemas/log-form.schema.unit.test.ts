import { describe, expect, it } from 'vitest';
import { logFormSchema } from './log-form.schema';

describe('log rating validation', () => {
	const log = { tmdbId: 550, dateWatched: '2026-09-13' };
	it.each([undefined, null, 1, 10])('accepts optional rating %s', (rating) => {
		expect(logFormSchema.safeParse({ ...log, rating }).success).toBe(true);
	});
	it.each([0, 11, 1.5, '8'])('rejects invalid rating %s', (rating) => {
		expect(logFormSchema.safeParse({ ...log, rating }).success).toBe(false);
	});
});
