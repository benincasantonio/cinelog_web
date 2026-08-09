import { create } from 'zustand';
import { createLatestRequestGuard } from '@/lib/utilities/latest-request-guard';
import type { TMDBMovieSearchResult } from '../models';
import { search } from '../repositories/movies-repository';

interface MoviesStore {
	movieSearchResult: TMDBMovieSearchResult | undefined;
	isLoading: boolean;
	searched: boolean;

	loadMovieSearchResults: (query: string) => Promise<void>;
	resetMovieSearchResults: () => void;
}

export const useMoviesStore = create<MoviesStore>((set) => {
	const searchGuard = createLatestRequestGuard();

	return {
		movieSearchResult: undefined,
		isLoading: false,
		searched: false,

		loadMovieSearchResults: async (query: string) => {
			const requestId = searchGuard.start();
			set({ isLoading: true, movieSearchResult: undefined });
			try {
				const results = await search(query);
				if (searchGuard.isStale(requestId)) return;
				set({ movieSearchResult: results, isLoading: false, searched: true });
			} catch (error) {
				if (searchGuard.isStale(requestId)) return;
				console.error('Error loading movie search results:', error);
				set({ isLoading: false });
			}
		},
		resetMovieSearchResults: () => {
			searchGuard.invalidate();
			set({
				movieSearchResult: undefined,
				isLoading: false,
				searched: false,
			});
		},
	};
});
