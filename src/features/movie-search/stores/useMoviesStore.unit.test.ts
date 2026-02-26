import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSearch = vi.fn();
vi.mock('../repositories/movies-repository', () => ({
	search: (...args: unknown[]) => mockSearch(...args),
}));

import { useMoviesStore } from './useMoviesStore';

describe('useMoviesStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useMoviesStore.setState({
			movieSearchResult: undefined,
			isLoading: false,
			searched: false,
		});
	});

	describe('initial state', () => {
		it('should have correct initial values', () => {
			const state = useMoviesStore.getState();

			expect(state.movieSearchResult).toBeUndefined();
			expect(state.isLoading).toBe(false);
			expect(state.searched).toBe(false);
		});
	});

	describe('loadMovieSearchResults', () => {
		it('should set isLoading to true while searching', async () => {
			let resolveSearch: (value: unknown) => void;
			const searchPromise = new Promise((resolve) => {
				resolveSearch = resolve;
			});
			mockSearch.mockReturnValueOnce(searchPromise);

			const promise = useMoviesStore.getState().loadMovieSearchResults('test');

			expect(useMoviesStore.getState().isLoading).toBe(true);

			resolveSearch!({ results: [] });
			await promise;
		});

		it('should call search with the query', async () => {
			mockSearch.mockResolvedValueOnce({ results: [] });

			await useMoviesStore.getState().loadMovieSearchResults('Inception');

			expect(mockSearch).toHaveBeenCalledWith('Inception');
		});

		it('should set results and searched after successful search', async () => {
			const results = { results: [{ id: 1, title: 'Inception' }] };
			mockSearch.mockResolvedValueOnce(results);

			await useMoviesStore.getState().loadMovieSearchResults('Inception');

			const state = useMoviesStore.getState();
			expect(state.movieSearchResult).toEqual(results);
			expect(state.isLoading).toBe(false);
			expect(state.searched).toBe(true);
		});

		it('should set isLoading to false on error', async () => {
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => undefined);
			mockSearch.mockRejectedValueOnce(new Error('Network error'));

			await useMoviesStore.getState().loadMovieSearchResults('test');

			expect(useMoviesStore.getState().isLoading).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith(
				'Error loading movie search results:',
				expect.any(Error)
			);
			consoleSpy.mockRestore();
		});
	});

	describe('resetMovieSearchResults', () => {
		it('should clear movieSearchResult', () => {
			useMoviesStore.setState({
				movieSearchResult: { results: [{ id: 1 }] } as never,
			});

			useMoviesStore.getState().resetMovieSearchResults();

			expect(useMoviesStore.getState().movieSearchResult).toBeUndefined();
		});
	});
});
