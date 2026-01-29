import { create } from 'zustand';
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
	return {
		movieDetails: undefined,
		movieRating: undefined,
		isLoading: false,
		isMovieRatingLoading: false,
		loadMovieDetails: async (tmdbId: number) => {
			set({ isLoading: true, movieDetails: undefined });
			try {
				const details = await getDetails(tmdbId);
				set({ movieDetails: details, isLoading: false });
			} catch (error) {
				console.error('Error loading movie details:', error);
				set({ isLoading: false });
			}
		},
		setMovieRating: (movieRating: MovieRatingResponse) => {
			set({ movieRating });
		},
		resetMovieDetails: () => {
			set({ movieDetails: undefined, movieRating: undefined });
		},
		loadMovieRating: async (tmdbId: number) => {
			set({ isMovieRatingLoading: true, movieRating: undefined });
			try {
				const rating = await getMovieRating(tmdbId);
				set({ movieRating: rating, isMovieRatingLoading: false });
			} catch (error) {
				console.error('Error loading movie rating:', error);
				set({ isMovieRatingLoading: false });
			}
		},
	};
});
