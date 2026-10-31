import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreateOrUpdateRating } = vi.hoisted(() => ({
	mockCreateOrUpdateRating: vi.fn(),
}));

vi.mock('../repositories/movie-rating-repository', () => ({
	createOrUpdateRating: mockCreateOrUpdateRating,
}));

import { useMovieRatingStore } from './useMovieRatingStore';

describe('useMovieRatingStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useMovieRatingStore.setState({
			isOpen: false,
			isLoading: false,
			movieId: null,
			movieRating: null,
		});
	});

	it('opens and closes modal', () => {
		useMovieRatingStore
			.getState()
			.openModal('a0000000-0000-4000-8000-000000000123', {
				rating: 8,
			} as never);
		expect(useMovieRatingStore.getState().isOpen).toBe(true);
		expect(useMovieRatingStore.getState().movieId).toBe(
			'a0000000-0000-4000-8000-000000000123'
		);

		useMovieRatingStore.getState().closeModal();
		expect(useMovieRatingStore.getState().isOpen).toBe(false);
		expect(useMovieRatingStore.getState().movieId).toBeNull();
	});

	it('sets open state directly with setIsOpen', () => {
		useMovieRatingStore.getState().setIsOpen(true);
		expect(useMovieRatingStore.getState().isOpen).toBe(true);
		useMovieRatingStore.getState().setIsOpen(false);
		expect(useMovieRatingStore.getState().isOpen).toBe(false);
	});

	it('returns early when movieId is missing', async () => {
		const result = await useMovieRatingStore.getState().submitRating(7, 'ok');
		expect(result).toBeUndefined();
		expect(mockCreateOrUpdateRating).not.toHaveBeenCalled();
	});

	it('submits rating and trims comment', async () => {
		useMovieRatingStore
			.getState()
			.openModal('a0000000-0000-4000-8000-000000000550');
		const response = {
			id: '1',
			movieId: 'a0000000-0000-4000-8000-000000000550',
			rating: 9,
			comment: 'great',
		};
		mockCreateOrUpdateRating.mockResolvedValueOnce(response);

		const result = await useMovieRatingStore
			.getState()
			.submitRating(9, '  great  ');

		expect(mockCreateOrUpdateRating).toHaveBeenCalledWith({
			movieId: 'a0000000-0000-4000-8000-000000000550',
			rating: 9,
			comment: 'great',
		});
		expect(result).toEqual(response);
		expect(useMovieRatingStore.getState().isOpen).toBe(false);
		expect(useMovieRatingStore.getState().isLoading).toBe(false);
	});

	it('handles submit error and resets loading', async () => {
		const consoleSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
		useMovieRatingStore
			.getState()
			.openModal('a0000000-0000-4000-8000-000000000550');
		mockCreateOrUpdateRating.mockRejectedValueOnce(new Error('failed'));

		await useMovieRatingStore.getState().submitRating(1);

		expect(useMovieRatingStore.getState().isLoading).toBe(false);
		expect(useMovieRatingStore.getState().error).toBe('temporary');
		consoleSpy.mockRestore();
	});
});
