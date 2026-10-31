import { create } from 'zustand';
import type { MovieRatingResponse } from '../models';
import { createOrUpdateRating } from '../repositories/movie-rating-repository';

interface MovieRatingState {
	isOpen: boolean;
	isLoading: boolean;
	movieId: string | null;
	movieRating: MovieRatingResponse | null;
	openModal: (
		movieId: string,
		movieRating?: MovieRatingResponse | null
	) => void;
	closeModal: () => void;
	setIsOpen: (isOpen: boolean) => void;
	submitRating: (
		rating: number,
		comment?: string
	) => Promise<MovieRatingResponse | void>;
}

export const useMovieRatingStore = create<MovieRatingState>((set, get) => ({
	isOpen: false,
	isLoading: false,
	movieId: null,
	movieRating: null,
	openModal: (movieId, movieRating = null) =>
		set({ isOpen: true, movieId, movieRating }),
	closeModal: () => set({ isOpen: false, movieId: null, movieRating: null }),
	setIsOpen: (isOpen) => set({ isOpen }),
	submitRating: async (rating, comment) => {
		const { movieId } = get();
		if (!movieId) return;

		set({ isLoading: true });
		try {
			const movieRating = await createOrUpdateRating({
				movieId,
				rating,
				comment: comment?.trim() || null,
			});
			set({ isOpen: false });
			return movieRating;
		} catch (error) {
			console.error('Failed to rate movie', error);
		} finally {
			set({ isLoading: false });
		}
	},
}));
