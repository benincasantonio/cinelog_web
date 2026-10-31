import { apiClient } from '@/lib/api/client';
import type { MovieResolveResponse } from '../models/movie-resolve';
import type { TMDBMovieDetails } from '../models/tmdb-movie-details';
import { movieIdSchema } from '../schemas/movie-id.schema';

export const getDetails = async (
	movieId: string
): Promise<TMDBMovieDetails> => {
	movieIdSchema.parse(movieId);
	return apiClient.get(`v1/movies/${movieId}`).json();
};

export const resolveMovie = async (
	movieRef: string
): Promise<MovieResolveResponse> => {
	return apiClient.post('v1/movies/resolve', { json: { movieRef } }).json();
};
