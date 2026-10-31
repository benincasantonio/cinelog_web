import { apiClient } from '@/lib/api/client';
import type { MovieRatingCreateUpdateRequest } from '../models/movie-rating-request';
import type { MovieRatingResponse } from '../models/movie-rating-response';
import { movieIdSchema } from '../schemas/movie-id.schema';

export const createOrUpdateRating = async (
	request: MovieRatingCreateUpdateRequest
): Promise<MovieRatingResponse> => {
	return apiClient
		.post('v1/movie-ratings/', {
			json: request,
		})
		.json();
};

export const getMovieRating = async (
	movieId: string
): Promise<MovieRatingResponse | undefined> => {
	movieIdSchema.parse(movieId);
	const response = await apiClient.get(`v1/movie-ratings/${movieId}`);

	if (response.status === 204) {
		return undefined;
	}

	return await response.json();
};
