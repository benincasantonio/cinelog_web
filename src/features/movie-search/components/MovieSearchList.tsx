import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMoviesStore } from '../store/useMoviesStore';

export const MovieSearchList = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const movieSearchResult = useMoviesStore((state) => state.movieSearchResult);
	const isLoading = useMoviesStore((state) => state.isLoading);
	const searched = useMoviesStore((state) => state.searched);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-8">
				<div className="text-lg text-gray-600">
					{t('MovieSearchList.searching')}
				</div>
			</div>
		);
	}

	if (!searched) {
		return (
			<div className="flex justify-center items-center py-8">
				<div className="text-lg text-gray-600">
					{t('MovieSearchList.startTyping')}
				</div>
			</div>
		);
	}

	if (!movieSearchResult || movieSearchResult.results.length === 0) {
		return (
			<div className="flex justify-center items-center py-8">
				<div className="text-lg text-gray-600">
					{t('MovieSearchList.noMoviesFound')}
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col p-4 gap-2">
			<h3 className="px-2 py-2 text-sm font-bold text-gray-700 dark:text-gray-500 uppercase tracking-wider mb-2">
				{t('MovieSearchList.topResults')}
			</h3>
			{movieSearchResult.results.map((movie) => (
				<div
					key={movie.id}
					onClick={() => navigate(`/movies/${movie.id}`)}
					className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10"
				>
					<div
						className="w-[60px] h-[90px] shrink-0 rounded-lg bg-cover bg-center shadow-md group-hover:shadow-lg transition-shadow"
						style={{
							backgroundImage: movie.posterPath
								? `url(https://image.tmdb.org/t/p/w200${movie.posterPath})`
								: undefined,
						}}
					>
						{!movie.posterPath && (
							<div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg">
								<span className="text-gray-400 dark:text-gray-600 text-xs">
									{t('MovieLogItem.noImage')}
								</span>
							</div>
						)}
					</div>
					<div className="flex flex-col flex-1 min-w-0">
						<h4 className="text-lg text-left font-bold text-gray-900 dark:text-white truncate">
							{movie.title}
						</h4>
						<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
							<span>{movie.releaseDate?.split('-')[0] || 'N/A'}</span>
							{movie.voteAverage > 0 && (
								<>
									<span className="w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></span>
									<span>★ {movie.voteAverage.toFixed(1)}</span>
								</>
							)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
};
