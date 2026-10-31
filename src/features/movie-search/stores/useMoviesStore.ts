import { create } from 'zustand';
import type { MovieError } from '@/features/movie/models/movie-error';
import { resolveMovie } from '@/features/movie/repositories/movies-repository';
import { movieIdSchema } from '@/features/movie/schemas/movie-id.schema';
import { getMovieError } from '@/features/movie/utilities/movie-error';
import { createLatestRequestGuard } from '@/lib/utilities/latest-request-guard';
import type { MovieSearchResult, MovieSearchResultItem } from '../models';
import { search } from '../repositories/movies-repository';

type MoviesStore = {
	query: string;
	movieSearchResult: MovieSearchResult | undefined;
	isLoading: boolean;
	isLoadingMore: boolean;
	searched: boolean;
	searchError: MovieError | null;
	selectedMovie: MovieSearchResultItem | null;
	pendingSelectionKey: string | null;
	resolvedMovieId: string | null;
	selectionError: MovieError | null;
	loadMovieSearchResults: (query: string) => Promise<void>;
	loadMore: () => Promise<void>;
	retrySearch: () => Promise<void>;
	selectMovie: (movie: MovieSearchResultItem) => Promise<void>;
	retrySelection: () => Promise<void>;
	cancelMovieSelection: () => void;
	resetMovieSearchResults: () => void;
};

const selectionState = {
	selectedMovie: null,
	pendingSelectionKey: null,
	resolvedMovieId: null,
	selectionError: null,
};
const initialState = {
	...selectionState,
	query: '',
	movieSearchResult: undefined,
	isLoading: false,
	isLoadingMore: false,
	searched: false,
	searchError: null,
};

export const useMoviesStore = create<MoviesStore>((set, get) => {
	const searchGuard = createLatestRequestGuard();
	const selectionGuard = createLatestRequestGuard();
	return {
		...initialState,
		loadMovieSearchResults: async (query) => {
			const requestId = searchGuard.start();
			selectionGuard.invalidate();
			set({ ...initialState, query, isLoading: true });
			try {
				const results = await search(query);
				if (searchGuard.isStale(requestId)) return;
				set({ movieSearchResult: results, isLoading: false, searched: true });
			} catch (error) {
				const searchError = await getMovieError(error);
				if (searchGuard.isStale(requestId)) return;
				set({ isLoading: false, searched: true, searchError });
			}
		},
		loadMore: async () => {
			const {
				query,
				movieSearchResult,
				isLoading,
				isLoadingMore,
				searchError,
			} = get();
			const cursor = movieSearchResult?.nextCursor;
			if (!cursor || isLoading || isLoadingMore || searchError) return;
			const requestId = searchGuard.start();
			set({ isLoadingMore: true });
			try {
				const page = await search(query, cursor);
				if (searchGuard.isStale(requestId)) return;
				const results = [...(get().movieSearchResult?.results ?? [])];
				const seen = new Set(
					results.map((movie) => movie.id ?? movie.movieRef)
				);
				for (const movie of page.results) {
					const key = movie.id ?? movie.movieRef;
					if (seen.has(key)) continue;
					seen.add(key);
					results.push(movie);
				}
				set({
					movieSearchResult: { results, nextCursor: page.nextCursor },
					isLoadingMore: false,
				});
			} catch (error) {
				const searchError = await getMovieError(error);
				if (searchGuard.isStale(requestId)) return;
				set({ isLoadingMore: false, searchError });
			}
		},
		retrySearch: async () => {
			const { searchError, movieSearchResult, query } = get();
			if (searchError === 'invalidCursor' || !movieSearchResult) {
				await get().loadMovieSearchResults(query);
			} else {
				set({ searchError: null });
				await get().loadMore();
			}
		},
		selectMovie: async (movie) => {
			const key = movie.id ?? movie.movieRef;
			if (get().pendingSelectionKey === key) return;
			const requestId = selectionGuard.start();
			set({
				...selectionState,
				selectedMovie: movie,
				pendingSelectionKey: key,
			});
			try {
				const movieId =
					movie.id ?? (await resolveMovie(movie.movieRef)).movieId;
				const validId = movieIdSchema.parse(movieId);
				if (selectionGuard.isStale(requestId)) return;
				set({ resolvedMovieId: validId, pendingSelectionKey: null });
			} catch (error) {
				const selectionError = await getMovieError(error);
				if (selectionGuard.isStale(requestId)) return;
				set({ selectionError, pendingSelectionKey: null });
			}
		},
		retrySelection: async () => {
			const { selectedMovie, selectionError } = get();
			if (selectedMovie && selectionError === 'temporary')
				await get().selectMovie(selectedMovie);
		},
		cancelMovieSelection: () => {
			selectionGuard.invalidate();
			set(selectionState);
		},
		resetMovieSearchResults: () => {
			searchGuard.invalidate();
			selectionGuard.invalidate();
			set(initialState);
		},
	};
});
