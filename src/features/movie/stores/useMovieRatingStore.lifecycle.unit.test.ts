import { beforeEach, expect, it, vi } from 'vitest';
import {
	MOVIE_ID,
	OTHER_MOVIE_ID,
} from '@/features/movie-search/models/movie-search.test-utils';
import { useMovieRatingStore } from './useMovieRatingStore';

const { save } = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock('../repositories/movie-rating-repository', () => ({
	createOrUpdateRating: save,
}));
const state = () => useMovieRatingStore.getState();
beforeEach(() => {
	vi.resetAllMocks();
	state().closeModal();
});
it('rejects legacy identity without a write', async () => {
	state().openModal('550');
	await state().submitRating(8);
	expect(save).not.toHaveBeenCalled();
});
it('does not close a newer dialog or return an old rating after a delayed save', async () => {
	let finish!: (value: unknown) => void;
	save.mockReturnValueOnce(
		new Promise((done) => {
			finish = done;
		})
	);
	state().openModal(MOVIE_ID);
	const request = state().submitRating(8);
	state().openModal(OTHER_MOVIE_ID);
	finish({ movieId: MOVIE_ID, rating: 8 });
	expect(await request).toBeUndefined();
	expect(state().isOpen).toBe(true);
	expect(state().movieId).toBe(OTHER_MOVIE_ID);
});
it('invalidates a closed session even when the same movie is reopened', async () => {
	let finish!: (value: unknown) => void;
	save.mockReturnValueOnce(
		new Promise((done) => {
			finish = done;
		})
	);
	state().openModal(MOVIE_ID);
	const request = state().submitRating(8);
	state().setIsOpen(false);
	state().openModal(MOVIE_ID);
	finish({ movieId: MOVIE_ID, rating: 8 });
	expect(await request).toBeUndefined();
	expect(state().isOpen).toBe(true);
});
it('preserves the modal and exposes recoverable errors', async () => {
	save.mockRejectedValue(new Error('offline'));
	state().openModal(MOVIE_ID);
	await state().submitRating(8);
	expect(state().isOpen).toBe(true);
	expect(state().error).toBe('temporary');
});
