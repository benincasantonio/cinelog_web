import { apiClient } from '@/lib/api/client';
import type { MovieRatingCreateUpdateRequest } from '../models/movie-rating-request';
import type { MovieRatingResponse } from '../models/movie-rating-response';

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
	tmdbId: number
): Promise<MovieRatingResponse | undefined> => {
	const response = await apiClient.get(`v1/movie-ratings/${tmdbId}`);

	if (response.status === 204) {
		return undefined;
	}

	return await response.json();
};
