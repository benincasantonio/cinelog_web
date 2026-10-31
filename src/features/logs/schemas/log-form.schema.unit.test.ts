import { describe, expect, it } from 'vitest';
import { logFormSchema } from './log-form.schema';

describe('log rating validation', () => {
	const log = {
		movieId: '6f1c2a9e-5738-46f6-bfc7-4c8e518de561',
		dateWatched: '2026-09-13',
	};
	it.each([undefined, null, 1, 10])('accepts optional rating %s', (rating) => {
		expect(logFormSchema.safeParse({ ...log, rating }).success).toBe(true);
	});
	it.each([0, 11, 1.5, '8'])('rejects invalid rating %s', (rating) => {
		expect(logFormSchema.safeParse({ ...log, rating }).success).toBe(false);
	});
	it.each([
		undefined,
		null,
		'',
		'550',
		550,
		'movie-uuid',
	])('rejects unresolved or invalid identity %s', (movieId) => {
		expect(logFormSchema.safeParse({ ...log, movieId }).success).toBe(false);
	});
	it('rejects legacy identity even next to a valid UUID', () => {
		expect(logFormSchema.safeParse({ ...log, tmdbId: 550 }).success).toBe(
			false
		);
	});
});
