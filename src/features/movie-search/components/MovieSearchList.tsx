import { Button } from '@antoniobenincasa/ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMoviesStore } from '../stores/useMoviesStore';

export const MovieSearchList = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const {
		movieSearchResult,
		isLoading,
		isLoadingMore,
		searched,
		searchError,
		pendingSelectionKey,
		resolvedMovieId,
		selectionError,
		selectMovie,
		cancelMovieSelection,
		retrySelection,
		loadMore,
		retrySearch,
		loadMovieSearchResults,
		query,
	} = useMoviesStore((state) => state);
	const sentinel = useRef<HTMLDivElement>(null);
	const nextCursor = movieSearchResult?.nextCursor;
	useEffect(() => cancelMovieSelection, [cancelMovieSelection]);
	useEffect(() => {
		if (resolvedMovieId) navigate(`/movies/${resolvedMovieId}`);
	}, [resolvedMovieId, navigate]);
	useEffect(() => {
		if (
			!nextCursor ||
			isLoading ||
			isLoadingMore ||
			searchError ||
			!sentinel.current ||
			typeof IntersectionObserver === 'undefined'
		)
			return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) void loadMore();
			},
			{ rootMargin: '200px' }
		);
		observer.observe(sentinel.current);
		return () => observer.disconnect();
	}, [nextCursor, isLoading, isLoadingMore, searchError, loadMore]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-8">
				<div role="status" className="text-lg text-gray-600">
					{t('MovieSearchList.searching')}
				</div>
			</div>
		);
	}

	if (!searched && !searchError) {
		return (
			<div className="flex justify-center items-center py-8">
				<div role="status" className="text-lg text-gray-600">
					{t('MovieSearchList.startTyping')}
				</div>
			</div>
		);
	}

	if (
		searched &&
		!searchError &&
		!nextCursor &&
		!movieSearchResult?.results.length
	) {
		return (
			<div className="flex justify-center items-center py-8">
				<div role="status" className="text-lg text-gray-600">
					{t('MovieSearchList.noMoviesFound')}
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col p-4 gap-2">
			{!!movieSearchResult?.results.length && (
				<h3 className="px-2 py-2 text-sm font-bold text-gray-700 dark:text-gray-500 uppercase tracking-wider mb-2">
					{t('MovieSearchList.topResults')}
				</h3>
			)}
			{pendingSelectionKey && (
				<p role="status">{t('MovieSelection.resolving')}</p>
			)}
			{selectionError && (
				<div>
					<p role="alert">{t(`MovieSelection.${selectionError}`)}</p>
					{selectionError === 'temporary' && (
						<Button type="button" variant="outline" onClick={retrySelection}>
							{t('MovieSelection.retry')}
						</Button>
					)}
					{selectionError === 'invalidReference' && (
						<Button
							type="button"
							variant="outline"
							onClick={() => loadMovieSearchResults(query)}
						>
							{t('MovieSelection.searchAgain')}
						</Button>
					)}
				</div>
			)}
			{movieSearchResult?.results.map((movie) => (
				<button
					type="button"
					key={movie.id ?? movie.movieRef}
					aria-disabled={pendingSelectionKey === (movie.id ?? movie.movieRef)}
					aria-busy={pendingSelectionKey === (movie.id ?? movie.movieRef)}
					onClick={() => selectMovie(movie)}
					className="group w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10"
				>
					<span
						className="w-[60px] h-[90px] shrink-0 rounded-lg bg-cover bg-center shadow-md group-hover:shadow-lg transition-shadow"
						style={{
							backgroundImage: movie.posterPath
								? `url(https://image.tmdb.org/t/p/w200${movie.posterPath})`
								: undefined,
						}}
					>
						{!movie.posterPath && (
							<span className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg">
								<span className="text-gray-400 dark:text-gray-600 text-xs">
									{t('MovieLogItem.noImage')}
								</span>
							</span>
						)}
					</span>
					<span className="flex flex-col flex-1 min-w-0">
						<span className="text-lg text-left font-bold text-gray-900 dark:text-white truncate">
							{movie.title}
						</span>
						<span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
							<span>{movie.releaseDate?.split('-')[0] || 'N/A'}</span>
							{movie.voteAverage > 0 && (
								<>
									<span className="w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></span>
									<span>★ {movie.voteAverage.toFixed(1)}</span>
								</>
							)}
						</span>
					</span>
				</button>
			))}
			{searchError && (
				<div>
					<p role="alert">
						{t(
							searchError === 'invalidCursor'
								? 'MovieSelection.invalidCursor'
								: 'MovieSearchList.loadError'
						)}
					</p>
					<Button type="button" variant="outline" onClick={retrySearch}>
						{t(
							searchError === 'invalidCursor'
								? 'MovieSelection.searchAgain'
								: 'MovieSelection.retry'
						)}
					</Button>
				</div>
			)}
			{nextCursor && !searchError && (
				<div ref={sentinel}>
					{!movieSearchResult?.results.length && (
						<p role="status">{t('MovieSearchList.moreResults')}</p>
					)}
					<Button
						type="button"
						variant="outline"
						onClick={loadMore}
						disabled={isLoadingMore}
					>
						{t(
							isLoadingMore
								? 'MovieSearchList.searching'
								: 'MovieSearchList.loadMore'
						)}
					</Button>
				</div>
			)}
		</div>
	);
};
