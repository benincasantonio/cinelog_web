import { create } from 'zustand';
import type { MovieRatingResponse } from '../models';
import { createOrUpdateRating } from '../repositories/movie-rating-repository';

interface MovieRatingState {
	isOpen: boolean;
	isLoading: boolean;
	tmdbId: string | null;
	movieRating: MovieRatingResponse | null;
	openModal: (tmdbId: string, movieRating?: MovieRatingResponse | null) => void;
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
	tmdbId: null,
	movieRating: null,
	openModal: (tmdbId, movieRating = null) =>
		set({ isOpen: true, tmdbId, movieRating }),
	closeModal: () => set({ isOpen: false, tmdbId: null, movieRating: null }),
	setIsOpen: (isOpen) => set({ isOpen }),
	submitRating: async (rating, comment) => {
		const { tmdbId } = get();
		if (!tmdbId) return;

		set({ isLoading: true });
		try {
			const movieRating = await createOrUpdateRating({
				tmdbId,
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
