import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetDetails, mockGetMovieRating } = vi.hoisted(() => ({
	mockGetDetails: vi.fn(),
	mockGetMovieRating: vi.fn(),
}));

vi.mock('../repositories/movies-repository', () => ({
	getDetails: mockGetDetails,
}));

vi.mock('../repositories/movie-rating-repository', () => ({
	getMovieRating: mockGetMovieRating,
}));

import { useMovieDetailsStore } from './useMovieDetailsStore';

describe('useMovieDetailsStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useMovieDetailsStore.setState({
			movieDetails: undefined,
			movieRating: undefined,
			isLoading: false,
			isMovieRatingLoading: false,
		});
	});

	it('loads movie details successfully', async () => {
		const details = { id: 1, title: 'Inception' };
		mockGetDetails.mockResolvedValueOnce(details);

		await useMovieDetailsStore.getState().loadMovieDetails(1);

		expect(mockGetDetails).toHaveBeenCalledWith(1);
		expect(useMovieDetailsStore.getState().movieDetails).toEqual(details);
		expect(useMovieDetailsStore.getState().isLoading).toBe(false);
	});

	it('handles movie details loading error', async () => {
		const consoleSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
		mockGetDetails.mockRejectedValueOnce(new Error('boom'));

		await useMovieDetailsStore.getState().loadMovieDetails(1);

		expect(useMovieDetailsStore.getState().isLoading).toBe(false);
		expect(consoleSpy).toHaveBeenCalledWith(
			'Error loading movie details:',
			expect.any(Error)
		);
		consoleSpy.mockRestore();
	});

	it('sets and resets movie rating state', () => {
		const movieRating = { rating: 8, comment: 'great' };
		useMovieDetailsStore.getState().setMovieRating(movieRating as never);
		expect(useMovieDetailsStore.getState().movieRating).toEqual(movieRating);

		useMovieDetailsStore.getState().resetMovieDetails();
		expect(useMovieDetailsStore.getState().movieDetails).toBeUndefined();
		expect(useMovieDetailsStore.getState().movieRating).toBeUndefined();
	});

	it('loads movie rating successfully', async () => {
		const rating = { rating: 9, comment: 'top' };
		mockGetMovieRating.mockResolvedValueOnce(rating);

		await useMovieDetailsStore.getState().loadMovieRating(10);

		expect(mockGetMovieRating).toHaveBeenCalledWith(10);
		expect(useMovieDetailsStore.getState().movieRating).toEqual(rating);
		expect(useMovieDetailsStore.getState().isMovieRatingLoading).toBe(false);
	});

	it('handles movie rating loading error', async () => {
		const consoleSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
		mockGetMovieRating.mockRejectedValueOnce(new Error('boom'));

		await useMovieDetailsStore.getState().loadMovieRating(10);

		expect(useMovieDetailsStore.getState().isMovieRatingLoading).toBe(false);
		expect(consoleSpy).toHaveBeenCalledWith(
			'Error loading movie rating:',
			expect.any(Error)
		);
		consoleSpy.mockRestore();
	});
});
