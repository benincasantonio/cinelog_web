import { create } from 'zustand';
import { createLatestRequestGuard } from '@/lib/utilities/latest-request-guard';
import type { MovieRatingResponse } from '../models';
import type { TMDBMovieDetails } from '../models/tmdb-movie-details';
import { getMovieRating } from '../repositories/movie-rating-repository';
import { getDetails } from '../repositories/movies-repository';

interface MovieDetailsStore {
	movieDetails: TMDBMovieDetails | undefined;
	isLoading: boolean;
	movieRating: MovieRatingResponse | undefined;
	isMovieRatingLoading: boolean;
	loadMovieRating: (tmdbId: number) => Promise<void>;
	loadMovieDetails: (tmdbId: number) => Promise<void>;
	resetMovieDetails: () => void;
	setMovieRating: (movieRating: MovieRatingResponse) => void;
}

export const useMovieDetailsStore = create<MovieDetailsStore>((set) => {
	const detailsGuard = createLatestRequestGuard();

	return {
		movieDetails: undefined,
		movieRating: undefined,
		isLoading: false,
		isMovieRatingLoading: false,
		loadMovieDetails: async (tmdbId: number) => {
			const requestId = detailsGuard.start();
			set({ isLoading: true, movieDetails: undefined });
			try {
				const details = await getDetails(tmdbId);
				if (detailsGuard.isStale(requestId)) return;
				set({ movieDetails: details, isLoading: false });
			} catch (error) {
				if (detailsGuard.isStale(requestId)) return;
				console.error('Error loading movie details:', error);
				set({ isLoading: false });
			}
		},
		setMovieRating: (movieRating: MovieRatingResponse) => {
			set({ movieRating });
		},
		resetMovieDetails: () => {
			detailsGuard.invalidate();
			set({ movieDetails: undefined, movieRating: undefined });
		},
		loadMovieRating: async (tmdbId: number) => {
			set({ isMovieRatingLoading: true, movieRating: undefined });
			try {
				const rating = await getMovieRating(tmdbId);

				if (!rating) {
					return;
				}

				set({ movieRating: rating });
			} catch (error) {
				console.error('Error loading movie rating:', error);
			} finally {
				set({ isMovieRatingLoading: false });
			}
		},
	};
});
