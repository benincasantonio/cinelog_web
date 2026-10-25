import { queryOptions } from '@tanstack/react-query';
import type { Locale } from '@/lib/models';
import { search } from '../repositories';

export const movieSearchOptions = (query: string, locale: Locale) =>
	queryOptions({
		queryKey: ['movie-search', locale, query],
		enabled: query.length >= 3,
		queryFn: ({ signal }) => search(query, { signal, locale }),
	});
