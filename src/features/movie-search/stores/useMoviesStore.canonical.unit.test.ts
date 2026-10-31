import { HTTPError } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	MOVIE_ID,
	OTHER_MOVIE_ID,
	searchMovie,
} from '../models/movie-search.test-utils';
import { useMoviesStore } from './useMoviesStore';

const { search, resolveMovie } = vi.hoisted(() => ({
	search: vi.fn(),
	resolveMovie: vi.fn(),
}));
vi.mock('../repositories/movies-repository', () => ({ search }));
vi.mock('@/features/movie/repositories/movies-repository', () => ({
	resolveMovie,
}));

const mapped = searchMovie({ id: MOVIE_ID, movieRef: null });
const unmapped = searchMovie({ id: null, movieRef: 'opaque-reference' });
const state = () => useMoviesStore.getState();
const deferred = <T>() => {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((done) => {
		resolve = done;
	});
	return { promise, resolve };
};

beforeEach(() => {
	vi.resetAllMocks();
	state().resetMovieSearchResults();
});

describe('canonical search selection', () => {
	it('does not resolve while searching and directly selects catalog UUIDs', async () => {
		search.mockResolvedValue({ results: [mapped, unmapped], nextCursor: null });
		await state().loadMovieSearchResults('Inception');
		expect(resolveMovie).not.toHaveBeenCalled();
		await state().selectMovie(mapped);
		expect(resolveMovie).not.toHaveBeenCalled();
		expect(state().resolvedMovieId).toBe(MOVIE_ID);
	});
	it('resolves one reference once while repeated activation is pending', async () => {
		const pending = deferred<{ movieId: string }>();
		resolveMovie.mockReturnValue(pending.promise);
		const selection = state().selectMovie(unmapped);
		await state().selectMovie(unmapped);
		expect(resolveMovie).toHaveBeenCalledExactlyOnceWith('opaque-reference');
		expect(state().pendingSelectionKey).toBe('opaque-reference');
		pending.resolve({ movieId: MOVIE_ID });
		await selection;
		expect(state().resolvedMovieId).toBe(MOVIE_ID);
	});
	it('ignores slow A after selecting mapped B', async () => {
		const pending = deferred<{ movieId: string }>();
		resolveMovie.mockReturnValue(pending.promise);
		const selection = state().selectMovie(unmapped);
		await state().selectMovie(
			searchMovie({ id: OTHER_MOVIE_ID, movieRef: null }, 'B')
		);
		pending.resolve({ movieId: MOVIE_ID });
		await selection;
		expect(state().resolvedMovieId).toBe(OTHER_MOVIE_ID);
	});
	it.each([
		'resetMovieSearchResults',
		'cancelMovieSelection',
	] as const)('ignores completion after %s', async (action) => {
		const pending = deferred<{ movieId: string }>();
		resolveMovie.mockReturnValue(pending.promise);
		const selection = state().selectMovie(unmapped);
		state()[action]();
		pending.resolve({ movieId: MOVIE_ID });
		await selection;
		expect(state().resolvedMovieId).toBeNull();
	});
	it('keeps results on failure and supports an explicit retry', async () => {
		search.mockResolvedValue({ results: [unmapped], nextCursor: null });
		await state().loadMovieSearchResults('Inception');
		resolveMovie
			.mockRejectedValueOnce(new Error('offline'))
			.mockResolvedValueOnce({ movieId: MOVIE_ID });
		await state().selectMovie(unmapped);
		expect(state().selectionError).toBe('temporary');
		expect(state().movieSearchResult?.results).toEqual([unmapped]);
		expect(state().resolvedMovieId).toBeNull();
		await state().retrySelection();
		expect(state().resolvedMovieId).toBe(MOVIE_ID);
	});
	it.each([
		undefined,
		'11304',
		'bad-uuid',
	])('never navigates to a malformed resolve identity: %s', async (movieId) => {
		resolveMovie.mockResolvedValue({ movieId });
		await state().selectMovie(unmapped);
		expect(state().resolvedMovieId).toBeNull();
		expect(state().selectionError).toBe('temporary');
	});
});

describe('cursor pagination', () => {
	it('appends, deduplicates and follows empty pages until the cursor is null', async () => {
		search
			.mockResolvedValueOnce({ results: [mapped], nextCursor: 'page-two' })
			.mockResolvedValueOnce({ results: [], nextCursor: 'page-three' })
			.mockResolvedValueOnce({ results: [mapped, unmapped], nextCursor: null });
		await state().loadMovieSearchResults('Inception');
		await state().loadMore();
		expect(search).toHaveBeenLastCalledWith('Inception', 'page-two');
		expect(state().movieSearchResult?.nextCursor).toBe('page-three');
		await state().loadMore();
		await state().loadMore();
		expect(search).toHaveBeenCalledTimes(3);
		expect(state().movieSearchResult?.results).toEqual([mapped, unmapped]);
	});
	it('makes one page request at a time and ignores pages after a query reset', async () => {
		const page = deferred<unknown>();
		search
			.mockResolvedValueOnce({ results: [mapped], nextCursor: 'next' })
			.mockReturnValueOnce(page.promise);
		await state().loadMovieSearchResults('old');
		const loading = state().loadMore();
		await state().loadMore();
		expect(search).toHaveBeenCalledTimes(2);
		state().resetMovieSearchResults();
		page.resolve({ results: [unmapped], nextCursor: null });
		await loading;
		expect(state().movieSearchResult).toBeUndefined();
	});
	it('preserves loaded results and pauses pagination until Retry', async () => {
		search
			.mockResolvedValueOnce({ results: [mapped], nextCursor: 'next' })
			.mockRejectedValueOnce(new Error('rate limited'))
			.mockResolvedValueOnce({ results: [unmapped], nextCursor: null });
		await state().loadMovieSearchResults('Inception');
		await state().loadMore();
		await state().loadMore();
		expect(search).toHaveBeenCalledTimes(2);
		expect(state().movieSearchResult?.results).toEqual([mapped]);
		await state().retrySearch();
		expect(state().movieSearchResult?.results).toEqual([mapped, unmapped]);
	});
	it('restarts an invalid cursor only on explicit recovery', async () => {
		const error = new HTTPError(
			new Response(
				JSON.stringify({ error_code_name: 'INVALID_PAGINATION_CURSOR' }),
				{ status: 422 }
			),
			new Request('http://localhost/search'),
			{} as never
		);
		search
			.mockResolvedValueOnce({ results: [mapped], nextCursor: 'bad-cursor' })
			.mockRejectedValueOnce(error)
			.mockResolvedValueOnce({ results: [unmapped], nextCursor: null });
		await state().loadMovieSearchResults('Inception');
		await state().loadMore();
		expect(state().searchError).toBe('invalidCursor');
		await state().retrySearch();
		expect(search).toHaveBeenLastCalledWith('Inception');
		expect(state().movieSearchResult?.results).toEqual([unmapped]);
	});
});
