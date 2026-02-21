import { apiClient } from '@/lib/api/client';
import type { TMDBMovieDetails } from '../models/tmdb-movie-details';

export const getDetails = async (tmdbId: number): Promise<TMDBMovieDetails> => {
	return apiClient.get(`v1/movies/${tmdbId}`).json();
};
