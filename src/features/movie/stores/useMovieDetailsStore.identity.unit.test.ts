import { beforeEach, expect, it, vi } from 'vitest';
import {
	MOVIE_ID,
	OTHER_MOVIE_ID,
} from '@/features/movie-search/models/movie-search.test-utils';
import { useMovieDetailsStore } from './useMovieDetailsStore';

const { getDetails, getMovieRating } = vi.hoisted(() => ({
	getDetails: vi.fn(),
	getMovieRating: vi.fn(),
}));
vi.mock('../repositories/movies-repository', () => ({ getDetails }));
vi.mock('../repositories/movie-rating-repository', () => ({ getMovieRating }));
beforeEach(() => {
	vi.resetAllMocks();
	useMovieDetailsStore.getState().resetMovieDetails();
});
it('rejects a stale save callback for another movie', async () => {
	getDetails.mockResolvedValue({ id: OTHER_MOVIE_ID });
	await useMovieDetailsStore.getState().loadMovieDetails(OTHER_MOVIE_ID);
	useMovieDetailsStore
		.getState()
		.setMovieRating({ movieId: MOVIE_ID, rating: 8 } as never);
	expect(useMovieDetailsStore.getState().movieRating).toBeUndefined();
});
it('does not display a response belonging to another movie', async () => {
	getMovieRating.mockResolvedValue({ movieId: OTHER_MOVIE_ID, rating: 8 });
	await useMovieDetailsStore.getState().loadMovieRating(MOVIE_ID);
	expect(useMovieDetailsStore.getState().movieRating).toBeUndefined();
	expect(useMovieDetailsStore.getState().isMovieRatingLoading).toBe(false);
});
