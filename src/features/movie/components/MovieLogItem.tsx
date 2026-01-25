import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@antoniobenincasa/ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { LogListItem } from '@/features/logs/models';
import { MovieVote } from './MovieVote';
import { MoreVertical } from 'lucide-react';
import { useMovieLogDialogStore } from '@/features/logs';

interface MovieLogItemProps {
	log: LogListItem;
}

export const MovieLogItem = ({ log }: MovieLogItemProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const { open } = useMovieLogDialogStore();
	const handleTitleClick = () => {
		if (log.tmdbId) {
			navigate(`/movies/${log.tmdbId}`);
		}
	};

	const editMovieLog = () => {
		open({
			movieToEdit: log,
		});
	};

	return (
		<div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10">
			<div
				className="w-15 h-22.5 shrink-0 rounded-lg bg-cover bg-center shadow-md group-hover:shadow-lg transition-shadow"
				style={{
					backgroundImage: log.posterPath
						? `url(https://image.tmdb.org/t/p/w200${log.posterPath})`
						: undefined,
				}}
			>
				{!log.posterPath && (
					<div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg">
						<span className="text-gray-400 dark:text-gray-600 text-xs">
							{t('MovieLogItem.noImage')}
						</span>
					</div>
				)}
			</div>
			<div className="flex flex-col flex-1 min-w-0">
				<h4
					onClick={handleTitleClick}
					role="button"
					tabIndex={0}
					aria-label={`View ${log.movie?.title || t('MovieLogItem.unknownTitle')} details`}
					data-testid="movie-title-link"
					className="text-lg text-left font-bold text-gray-900 dark:text-white truncate cursor-pointer hover:opacity-75 transition-opacity"
				>
					{log.movie?.title || t('MovieLogItem.unknownTitle')}
				</h4>
				<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
					<span>
						{t('MovieLogItem.watched')}&nbsp;
						{new Date(log.dateWatched).toLocaleDateString()}
					</span>
					{log.watchedWhere && (
						<>
							<span className="w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></span>
							<span className="capitalize">{log.watchedWhere}</span>
						</>
					)}
				</div>

				<div className="flex items-center gap-2 mt-1">
					{!!log.movie?.voteAverage && (
						<MovieVote vote={log.movie.voteAverage} source="tmdb" />
					)}
					{log.movieRating !== null && (
						<MovieVote vote={log.movieRating || 0} source="user" />
					)}
				</div>
			</div>

			<div className="ml-auto">
				<DropdownMenu>
					<DropdownMenuTrigger className="outline-none">
						<MoreVertical className="w-4 h-4" size={5} />
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onClick={editMovieLog}>
							{t('MovieLogItem.edit')}
						</DropdownMenuItem>
						<DropdownMenuItem variant="destructive">
							{' '}
							{t('MovieLogItem.delete')}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
};
