import { apiClient } from '@/lib/api/client';
import type { MovieSearchResult } from '../models';

export const search = async (
	query: string,
	cursor?: string
): Promise<MovieSearchResult> => {
	return apiClient
		.get('v1/movies/search', {
			searchParams: cursor ? { query, cursor } : { query },
		})
		.json();
};
