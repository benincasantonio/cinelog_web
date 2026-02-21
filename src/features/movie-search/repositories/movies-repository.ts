import { apiClient } from '@/lib/api/client';
import type { TMDBMovieSearchResult } from '../models/tmdb-movie-search-result';

export const search = async (query: string): Promise<TMDBMovieSearchResult> => {
	return apiClient
		.get('v1/movies/search', {
			searchParams: { query },
		})
		.json();
};
