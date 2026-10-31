import { useCallback, useEffect, useRef, useState } from 'react';
import type { MovieError } from '@/features/movie/models';
import { resolveMovie } from '@/features/movie/repositories/movies-repository';
import { movieIdSchema } from '@/features/movie/schemas/movie-id.schema';
import { getMovieError } from '@/features/movie/utilities/movie-error';
import type { MovieSearchResultItem } from '@/features/movie-search/models';
import { search } from '@/features/movie-search/repositories';
import { createLatestRequestGuard } from '@/lib/utilities/latest-request-guard';

export const useLogMovieSelection = (
	initial: { movieId: string; title: string } | null,
	onSelect: (movieId: string) => void,
	locale?: string
) => {
	const searchGuard = useRef(createLatestRequestGuard()).current;
	const selectionGuard = useRef(createLatestRequestGuard()).current;
	const results = useRef<MovieSearchResultItem[]>([]);
	const selectedResult = useRef<MovieSearchResultItem | null>(null);
	const pendingKey = useRef<string | null>(null);
	const query = useRef('');
	const notify = useRef(onSelect);
	notify.current = onSelect;
	const [options, setOptions] = useState<
		Array<{ value: string; label: string }>
	>([]);
	const [selection, setSelection] = useState(
		initial && movieIdSchema.safeParse(initial.movieId).success
			? { value: initial.movieId, label: initial.title }
			: null
	);
	const [isSearching, setIsSearching] = useState(false);
	const [isResolving, setIsResolving] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [searchError, setSearchError] = useState<MovieError | null>(null);
	const [selectionError, setSelectionError] = useState<MovieError | null>(null);
	const initialId = initial?.movieId;
	const initialTitle = initial?.title;

	useEffect(() => {
		setSelection(
			initialId && movieIdSchema.safeParse(initialId).success
				? { value: initialId, label: initialTitle ?? '' }
				: null
		);
		setSelectionError(null);
		setIsResolving(false);
		pendingKey.current = null;
		return () => {
			searchGuard.invalidate();
			selectionGuard.invalidate();
		};
	}, [initialId, initialTitle, searchGuard, selectionGuard]);

	const filter = useCallback(
		async (value: string) => {
			query.current = value;
			const requestId = searchGuard.start();
			setSearchError(null);
			setHasMore(false);
			if (!value) {
				results.current = [];
				setOptions([]);
				setIsSearching(false);
				return;
			}
			setIsSearching(true);
			try {
				const page = await search(value);
				if (searchGuard.isStale(requestId)) return;
				results.current = page.results;
				setOptions(
					page.results.map((movie) => ({
						value: movie.id ?? movie.movieRef,
						label: movie.title,
					}))
				);
				setHasMore(page.nextCursor !== null);
			} catch (error) {
				const failure = await getMovieError(error);
				if (!searchGuard.isStale(requestId)) setSearchError(failure);
			} finally {
				if (!searchGuard.isStale(requestId)) setIsSearching(false);
			}
		},
		[searchGuard]
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: A locale change reloads the current query and invalidates old search results.
	useEffect(() => {
		if (query.current) void filter(query.current);
		return () => {
			searchGuard.invalidate();
		};
	}, [locale, filter, searchGuard]);

	const select = async (value: string) => {
		if (pendingKey.current === value && value) return;
		const requestId = selectionGuard.start();
		notify.current('');
		pendingKey.current = null;
		setIsResolving(false);
		setSelectionError(null);
		const movie = results.current.find(
			(item) => (item.id ?? item.movieRef) === value
		);
		selectedResult.current = movie ?? null;
		if (!movie) {
			if (
				value === selection?.value &&
				movieIdSchema.safeParse(value).success
			) {
				notify.current(value);
				return;
			}
			setSelection(null);
			return;
		}
		setSelection({ value, label: movie.title });
		pendingKey.current = value;
		setIsResolving(true);
		try {
			const movieId = movie.id ?? (await resolveMovie(movie.movieRef)).movieId;
			const id = movieIdSchema.parse(movieId);
			if (selectionGuard.isStale(requestId)) return;
			notify.current(id);
		} catch (error) {
			const failure = await getMovieError(error);
			if (!selectionGuard.isStale(requestId)) setSelectionError(failure);
		} finally {
			if (!selectionGuard.isStale(requestId)) {
				pendingKey.current = null;
				setIsResolving(false);
			}
		}
	};
	const retry = async () => {
		const movie = selectedResult.current;
		if (movie && selectionError === 'temporary') {
			// The selected result remains retryable even if the user filtered the picker meanwhile.
			if (!results.current.includes(movie))
				results.current = [...results.current, movie];
			await select(movie.id ?? movie.movieRef);
		}
	};
	const searchAgain = () => {
		void select('');
		return filter(query.current);
	};
	const items =
		selection && !options.some((option) => option.value === selection.value)
			? [selection, ...options]
			: options;
	return {
		items,
		selectedKey: selection?.value ?? '',
		isSearching,
		isResolving,
		hasMore,
		searchError,
		selectionError,
		filter,
		select,
		retry,
		searchAgain,
	};
};
