import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@antoniobenincasa/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LogListItem } from '@/features/logs/models';
import { type GetLogsParams, getLogs } from '@/features/logs/repositories';
import { useMovieLogDialogStore } from '@/features/logs/stores';
import type { MovieRatingResponse } from '@/features/movie/models';
import { useMovieRatingStore } from '@/features/movie/stores/useMovieRatingStore';
import { extractApiError } from '@/lib/api/api-error';
import { MovieLogList } from './MovieLogList';
import { MoviesWatchedLoading } from './MoviesWatchedLoading';
import { RateMovieModal } from './RateMovieModal';

interface MoviesWatchedProps {
	handle: string;
	isDropdownMenuVisible?: boolean;
}

export const MoviesWatched = ({
	handle,
	isDropdownMenuVisible,
}: MoviesWatchedProps) => {
	const { t } = useTranslation();
	const [logs, setLogs] = useState<LogListItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedYear, setSelectedYear] = useState<string>(
		new Date().getFullYear().toString()
	);
	const movieLogRefreshCounter = useMovieLogDialogStore(
		(state) => state.triggerCount
	);
	const movieRatingRefreshCounter = useMovieRatingStore(
		(state) => state.triggerCount
	);

	const handleRatingSuccess = useCallback(
		(movieRating: MovieRatingResponse) => {
			setLogs((prev) =>
				prev.map((log) =>
					log.tmdbId.toString() === movieRating.tmdbId
						? { ...log, movieRating: movieRating.rating }
						: log
				)
			);
		},
		[]
	);

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

	const fetchLogs = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const params: GetLogsParams = {};

			if (selectedYear !== 'all') {
				params.dateWatchedFrom = `${selectedYear}-01-01`;
				params.dateWatchedTo = `${selectedYear}-12-31`;
			}

			const response = await getLogs(handle, params);
			setLogs(response.logs);
		} catch (err) {
			const apiError = await extractApiError(err);
			if (apiError?.error_code_name === 'PROFILE_NOT_PUBLIC') {
				setError(t('ApiError.profileNotPublic'));
			} else if (err instanceof Error) {
				setError(err.message);
			} else {
				setError(t('MoviesWatched.errorLoading'));
			}
		} finally {
			setIsLoading(false);
		}
	}, [selectedYear, t]);

	const fetchLogsRef = useRef(fetchLogs);
	useEffect(() => {
		fetchLogsRef.current = fetchLogs;
	}, [fetchLogs]);

	// Initial load and re-fetch when year changes
	useEffect(() => {
		fetchLogs();
	}, [
		handle,
		selectedYear,
		movieLogRefreshCounter,
		movieRatingRefreshCounter,
		t,
	]);

	if (isLoading) {
		return <MoviesWatchedLoading />;
	}

	if (error) {
		return (
			<div className="flex justify-center items-center py-16">
				<div className="text-lg text-red-600 dark:text-red-400">{error}</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			<div className="p-4 border-b border-gray-300 dark:border-gray-700">
				<div className="flex items-center gap-4">
					<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
						{t('MoviesWatched.filterByYear')}
					</label>
					<Select value={selectedYear} onValueChange={setSelectedYear}>
						<SelectTrigger className="w-45">
							<SelectValue placeholder={t('MoviesWatched.selectYear')} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{t('MoviesWatched.allYears')}</SelectItem>
							{years.map((year) => (
								<SelectItem key={year} value={year.toString()}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<MovieLogList logs={logs} isDropdownMenuVisible={isDropdownMenuVisible} />
			<RateMovieModal onSuccess={handleRatingSuccess} />
		</div>
	);
};
