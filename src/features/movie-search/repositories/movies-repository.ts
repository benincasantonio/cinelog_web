import { apiClient } from '@/lib/api/client';
import { auth } from '@/lib/firebase';
import type { TMDBMovieSearchResult } from '../models/tmdb-movie-search-result';

export const search = async (query: string): Promise<TMDBMovieSearchResult> => {
	const token = await auth.currentUser?.getIdToken();

	return apiClient
		.get('v1/movies/search', {
			searchParams: { query },
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})
		.json();
};
