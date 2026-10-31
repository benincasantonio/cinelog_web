import { beforeEach, expect, it, vi } from 'vitest';
import { MOVIE_ID } from '@/features/movie-search/models/movie-search.test-utils';
import {
	createOrUpdateRating,
	getMovieRating,
} from './movie-rating-repository';
import { getDetails, resolveMovie } from './movies-repository';

const { get, post, json } = vi.hoisted(() => ({
	get: vi.fn(),
	post: vi.fn(),
	json: vi.fn(),
}));
vi.mock('@/lib/api/client', () => ({ apiClient: { get, post } }));
beforeEach(() => {
	vi.resetAllMocks();
	get.mockReturnValue({ json });
	post.mockReturnValue({ json });
});
it('resolves through the shared authenticated client with exactly the reference', async () => {
	json.mockResolvedValue({ movieId: MOVIE_ID });
	expect(await resolveMovie('opaque')).toEqual({ movieId: MOVIE_ID });
	expect(post).toHaveBeenCalledWith('v1/movies/resolve', {
		json: { movieRef: 'opaque' },
	});
});
it('loads canonical details without transforming the UUID', async () => {
	json.mockResolvedValue({ id: MOVIE_ID });
	expect(await getDetails(MOVIE_ID)).toEqual({ id: MOVIE_ID });
	expect(get).toHaveBeenCalledWith(`v1/movies/${MOVIE_ID}`);
});
it('preserves no-rating 204 semantics', async () => {
	get.mockResolvedValue({ status: 204, json });
	expect(await getMovieRating(MOVIE_ID)).toBeUndefined();
	expect(get).toHaveBeenCalledWith(`v1/movie-ratings/${MOVIE_ID}`);
	expect(json).not.toHaveBeenCalled();
});
it('sends only the canonical rating request', async () => {
	await createOrUpdateRating({ movieId: MOVIE_ID, rating: 8, comment: null });
	expect(post).toHaveBeenCalledWith('v1/movie-ratings/', {
		json: { movieId: MOVIE_ID, rating: 8, comment: null },
	});
});

it.each([
	'550',
	'not-a-uuid',
])('rejects invalid identity %s before any detail or rating request', async (id) => {
	await expect(getDetails(id)).rejects.toThrow();
	await expect(getMovieRating(id)).rejects.toThrow();
	expect(get).not.toHaveBeenCalled();
});
