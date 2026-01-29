import { create } from 'zustand';
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
	return {
		movieSearchResult: undefined,
		isLoading: false,
		searched: false,

		loadMovieSearchResults: async (query: string) => {
			set({ isLoading: true });
			try {
				const results = await search(query);
				set({ movieSearchResult: results, isLoading: false, searched: true });
			} catch (error) {
				console.error('Error loading movie search results:', error);
				set({ isLoading: false });
			}
		},
		resetMovieSearchResults: () => {
			set({ movieSearchResult: undefined });
		},
	};
});
