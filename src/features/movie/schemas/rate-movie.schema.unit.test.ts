import { expect, it } from 'vitest';
import { createRateMovieSchema } from './rate-movie.schema';

it('keeps rating validation and optional review text', () => {
	const schema = createRateMovieSchema('Choose a rating');
	expect(schema.safeParse({ rating: 0 }).success).toBe(false);
	expect(schema.parse({ rating: 8, comment: 'Review' })).toEqual({
		rating: 8,
		comment: 'Review',
	});
});
