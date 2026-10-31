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
			const results = {
				results: [
					{
						id: 'a0000000-0000-4000-8000-000000000001',
						movieRef: null,
						title: 'Inception',
					},
				],
			};
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
			expect(useMoviesStore.getState().searchError).toBe('temporary');
			consoleSpy.mockRestore();
		});

		it('ignores an older response that finishes after a newer search', async () => {
			let resolveFirst: (value: unknown) => void;
			let resolveSecond: (value: unknown) => void;
			mockSearch
				.mockReturnValueOnce(
					new Promise((resolve) => {
						resolveFirst = resolve;
					})
				)
				.mockReturnValueOnce(
					new Promise((resolve) => {
						resolveSecond = resolve;
					})
				);

			const firstRequest = useMoviesStore
				.getState()
				.loadMovieSearchResults('old');
			const secondRequest = useMoviesStore
				.getState()
				.loadMovieSearchResults('new');

			resolveSecond!({
				results: [
					{
						id: 'a0000000-0000-4000-8000-000000000002',
						movieRef: null,
						title: 'New locale',
					},
				],
			});
			await secondRequest;
			resolveFirst!({
				results: [
					{
						id: 'a0000000-0000-4000-8000-000000000001',
						movieRef: null,
						title: 'Old locale',
					},
				],
			});
			await firstRequest;

			expect(useMoviesStore.getState().movieSearchResult).toEqual({
				results: [
					{
						id: 'a0000000-0000-4000-8000-000000000002',
						movieRef: null,
						title: 'New locale',
					},
				],
			});
		});
	});

	describe('resetMovieSearchResults', () => {
		it('should clear movieSearchResult', () => {
			useMoviesStore.setState({
				movieSearchResult: {
					results: [
						{ id: 'a0000000-0000-4000-8000-000000000001', movieRef: null },
					],
				} as never,
			});

			useMoviesStore.getState().resetMovieSearchResults();

			expect(useMoviesStore.getState().movieSearchResult).toBeUndefined();
		});
	});
});
