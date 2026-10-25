import { apiClient } from '@/lib/api/client';
import type { Locale } from '@/lib/models';
import type { TMDBMovieSearchResult } from '../models/tmdb-movie-search-result';

export const search = async (
	query: string,
	options?: { signal?: AbortSignal; locale?: Locale }
): Promise<TMDBMovieSearchResult> => {
	return apiClient
		.get('v1/movies/search', {
			searchParams: { query },
			signal: options?.signal,
			headers: options?.locale
				? { 'Accept-Language': options.locale }
				: undefined,
		})
		.json();
};
