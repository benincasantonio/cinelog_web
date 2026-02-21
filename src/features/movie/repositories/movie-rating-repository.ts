import { apiClient } from '@/lib/api/client';
import type { MovieRatingCreateUpdateRequest } from '../models/movie-rating-request';
import type { MovieRatingResponse } from '../models/movie-rating-response';

export const createOrUpdateRating = async (
	request: MovieRatingCreateUpdateRequest
): Promise<MovieRatingResponse> => {
	return apiClient
		.post('v1/movie-ratings/', {
			json: request,
			headers: {
				'Content-Type': 'application/json',
			},
		})
		.json();
};

export const getMovieRating = async (
	tmdbId: number,
	userId?: string
): Promise<MovieRatingResponse> => {
	return apiClient
		.get(`v1/movie-ratings/${tmdbId}`, {
			searchParams: userId ? { user_id: userId } : undefined,
		})
		.json();
};
