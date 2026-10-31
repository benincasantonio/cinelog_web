import { create } from 'zustand';
import { createLatestRequestGuard } from '@/lib/utilities/latest-request-guard';
import type { MovieError, MovieRatingResponse } from '../models';
import { createOrUpdateRating } from '../repositories/movie-rating-repository';
import { movieIdSchema } from '../schemas/movie-id.schema';
import { getMovieError } from '../utilities/movie-error';

type MovieRatingState = {
	isOpen: boolean;
	isLoading: boolean;
	movieId: string | null;
	movieRating: MovieRatingResponse | null;
	error: MovieError | null;
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
};
const initialState = {
	isOpen: false,
	isLoading: false,
	movieId: null,
	movieRating: null,
	error: null,
};
export const useMovieRatingStore = create<MovieRatingState>((set, get) => {
	const guard = createLatestRequestGuard();
	return {
		...initialState,
		openModal: (movieId, movieRating = null) => {
			guard.invalidate();
			set({
				...initialState,
				isOpen: true,
				movieId,
				movieRating: movieRating?.movieId === movieId ? movieRating : null,
			});
		},
		closeModal: () => {
			guard.invalidate();
			set(initialState);
		},
		setIsOpen: (isOpen) => {
			if (isOpen) set({ isOpen });
			else get().closeModal();
		},
		submitRating: async (rating, comment) => {
			const { movieId, isLoading } = get();
			if (!movieIdSchema.safeParse(movieId).success || !movieId || isLoading)
				return;
			const requestId = guard.start();
			set({ isLoading: true, error: null });
			try {
				const result = await createOrUpdateRating({
					movieId,
					rating,
					comment: comment?.trim() || null,
				});
				if (guard.isStale(requestId)) return;
				if (result.movieId !== movieId)
					throw new Error('Rating response belongs to another movie');
				set({ isOpen: false });
				return result;
			} catch (error) {
				const failure = await getMovieError(error);
				if (!guard.isStale(requestId)) set({ error: failure });
			} finally {
				if (!guard.isStale(requestId)) set({ isLoading: false });
			}
		},
	};
});
