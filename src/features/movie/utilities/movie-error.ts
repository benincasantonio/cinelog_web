import { extractApiError } from '@/lib/api/api-error';
import type { MovieError } from '../models/movie-error';

export const getMovieError = async (error: unknown): Promise<MovieError> => {
	const body = await extractApiError(error);
	switch (body?.error_code_name) {
		case 'INVALID_MOVIE_REF':
			return 'invalidReference';
		case 'INVALID_PAGINATION_CURSOR':
			return 'invalidCursor';
		case 'PROVIDER_MOVIE_NOT_FOUND':
		case 'MOVIE_NOT_FOUND':
		case 'MOVIE_UNAVAILABLE':
			return 'unavailable';
		default:
			return 'temporary';
	}
};
