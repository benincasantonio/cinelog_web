import { HTTPError } from 'ky';
import { expect, it } from 'vitest';
import { getMovieError } from './movie-error';

it.each([
	['INVALID_MOVIE_REF', 'invalidReference'],
	['INVALID_PAGINATION_CURSOR', 'invalidCursor'],
	['PROVIDER_MOVIE_NOT_FOUND', 'unavailable'],
	['MOVIE_UNAVAILABLE', 'unavailable'],
	['MOVIE_NOT_FOUND', 'unavailable'],
	['PROVIDER_UNAVAILABLE', 'temporary'],
])('maps %s to recoverable %s feedback', async (code, expected) => {
	const error = new HTTPError(
		new Response(JSON.stringify({ error_code_name: code }), { status: 422 }),
		new Request('http://localhost/movie'),
		{} as never
	);
	expect(await getMovieError(error)).toBe(expected);
});
it('handles network and non-JSON failures', async () => {
	expect(await getMovieError(new Error('offline'))).toBe('temporary');
	const error = new HTTPError(
		new Response('unavailable', { status: 503 }),
		new Request('http://localhost/movie'),
		{} as never
	);
	expect(await getMovieError(error)).toBe('temporary');
});
