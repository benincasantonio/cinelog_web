import { apiClient } from '@/lib/api/client';
import { auth } from '@/lib/firebase';
import type { TMDBMovieDetails } from '../models/tmdb-movie-details';

export const getDetails = async (tmdbId: number): Promise<TMDBMovieDetails> => {
	const token = await auth.currentUser?.getIdToken();

	return apiClient
		.get(`v1/movies/${tmdbId}`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})
		.json();
};
