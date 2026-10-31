import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import {
	MOVIE_ID,
	OTHER_MOVIE_ID,
	searchMovie,
} from '@/features/movie-search/models/movie-search.test-utils';
import { useLogMovieSelection } from './useLogMovieSelection';

const { search, resolveMovie } = vi.hoisted(() => ({
	search: vi.fn(),
	resolveMovie: vi.fn(),
}));
vi.mock('@/features/movie-search/repositories', () => ({ search }));
vi.mock('@/features/movie/repositories/movies-repository', () => ({
	resolveMovie,
}));
const a = searchMovie({ id: null, movieRef: 'ref-a' }, 'A');
const b = searchMovie({ id: OTHER_MOVIE_ID, movieRef: null }, 'B');
beforeEach(() => {
	vi.resetAllMocks();
	search.mockResolvedValue({ results: [a, b], nextCursor: null });
});
it('keeps prefilled UUIDs without searching or resolving', () => {
	const selected = vi.fn();
	const { result } = renderHook(() =>
		useLogMovieSelection({ movieId: MOVIE_ID, title: 'A' }, selected)
	);
	expect(result.current.selectedKey).toBe(MOVIE_ID);
	expect(search).not.toHaveBeenCalled();
	expect(resolveMovie).not.toHaveBeenCalled();
});
it('resolves only selection, clears the old UUID immediately and blocks duplicate activation', async () => {
	let finish!: (value: { movieId: string }) => void;
	resolveMovie.mockReturnValue(
		new Promise((done) => {
			finish = done;
		})
	);
	const selected = vi.fn();
	const { result } = renderHook(() => useLogMovieSelection(null, selected));
	await act(() => result.current.filter('film'));
	expect(resolveMovie).not.toHaveBeenCalled();
	act(() => {
		void result.current.select('ref-a');
		void result.current.select('ref-a');
	});
	expect(selected).toHaveBeenLastCalledWith('');
	expect(result.current.isResolving).toBe(true);
	expect(result.current.selectedKey).toBe('ref-a');
	expect(resolveMovie).toHaveBeenCalledTimes(1);
	await act(async () => finish({ movieId: MOVIE_ID }));
	expect(selected).toHaveBeenLastCalledWith(MOVIE_ID);
	expect(result.current.isResolving).toBe(false);
});
it('ignores A after selecting B and after clear or unmount', async () => {
	let finish!: (value: { movieId: string }) => void;
	resolveMovie.mockImplementation(
		() =>
			new Promise((done) => {
				finish = done;
			})
	);
	const selected = vi.fn();
	const view = renderHook(() => useLogMovieSelection(null, selected));
	await act(() => view.result.current.filter('film'));
	act(() => {
		void view.result.current.select('ref-a');
	});
	await act(() => view.result.current.select(OTHER_MOVIE_ID));
	await act(async () => finish({ movieId: MOVIE_ID }));
	expect(selected).toHaveBeenLastCalledWith(OTHER_MOVIE_ID);
	act(() => {
		void view.result.current.select('ref-a');
	});
	await act(() => view.result.current.select(''));
	await act(async () => finish({ movieId: MOVIE_ID }));
	expect(selected).toHaveBeenLastCalledWith('');
	act(() => {
		void view.result.current.select('ref-a');
	});
	view.unmount();
	selected.mockClear();
	await act(async () => finish({ movieId: MOVIE_ID }));
	expect(selected).not.toHaveBeenCalled();
});
it('retains the displayed choice after failure and recovers on Retry', async () => {
	resolveMovie
		.mockRejectedValueOnce(new Error('offline'))
		.mockResolvedValueOnce({ movieId: MOVIE_ID });
	const selected = vi.fn();
	const { result } = renderHook(() => useLogMovieSelection(null, selected));
	await act(() => result.current.filter('film'));
	await act(() => result.current.select('ref-a'));
	expect(result.current.selectionError).toBe('temporary');
	expect(result.current.selectedKey).toBe('ref-a');
	expect(selected).toHaveBeenLastCalledWith('');
	await act(() => result.current.retry());
	expect(selected).toHaveBeenLastCalledWith(MOVIE_ID);
});
it('protects search results from stale requests and represents an empty first page with more results', async () => {
	let finish!: (value: unknown) => void;
	search
		.mockReturnValueOnce(
			new Promise((done) => {
				finish = done;
			})
		)
		.mockResolvedValueOnce({ results: [], nextCursor: 'more' });
	const { result } = renderHook(() => useLogMovieSelection(null, vi.fn()));
	act(() => {
		void result.current.filter('old');
	});
	await act(() => result.current.filter('new'));
	await act(async () => finish({ results: [a], nextCursor: null }));
	expect(result.current.items).toEqual([]);
	expect(result.current.hasMore).toBe(true);
	await waitFor(() => expect(result.current.isSearching).toBe(false));
});

it('keeps a selected prefill selectable after the picker is filtered', async () => {
	const selected = vi.fn();
	const { result } = renderHook(() =>
		useLogMovieSelection({ movieId: MOVIE_ID, title: 'Prefilled' }, selected)
	);
	await act(() => result.current.filter('different query'));
	await act(() => result.current.select(MOVIE_ID));
	expect(selected).toHaveBeenLastCalledWith(MOVIE_ID);
	expect(result.current.selectedKey).toBe(MOVIE_ID);
	expect(resolveMovie).not.toHaveBeenCalled();
});
it('ignores pending searches across locale changes and unmount', async () => {
	let finish!: (page: unknown) => void;
	search.mockReturnValueOnce(
		new Promise((done) => {
			finish = done;
		})
	);
	const view = renderHook(
		({ locale }) => useLogMovieSelection(null, vi.fn(), locale),
		{ initialProps: { locale: 'en' } }
	);
	act(() => {
		void view.result.current.filter('film');
	});
	view.rerender({ locale: 'it' });
	await waitFor(() => expect(view.result.current.items).toHaveLength(2));
	await act(async () => finish({ results: [], nextCursor: null }));
	expect(view.result.current.items).toHaveLength(2);
	search.mockReturnValueOnce(
		new Promise((done) => {
			finish = done;
		})
	);
	act(() => {
		void view.result.current.filter('later');
	});
	view.unmount();
	await act(async () => finish({ results: [], nextCursor: null }));
});

it('does not display a malformed prefilled identity as selectable', () => {
	const { result } = renderHook(() =>
		useLogMovieSelection({ movieId: '550', title: 'Legacy' }, vi.fn())
	);
	expect(result.current.selectedKey).toBe('');
	expect(result.current.items).toEqual([]);
});
