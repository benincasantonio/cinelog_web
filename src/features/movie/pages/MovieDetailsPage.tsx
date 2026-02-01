import { Skeleton } from '@antoniobenincasa/ui';
import { Clapperboard, Star } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useMovieLogDialogStore } from '@/features/logs/stores';
import { MovieDetailsHero } from '../components/MovieDetailsHero';
import { MovieGenres } from '../components/MovieGenres';
import { MovieRuntime } from '../components/MovieRuntime';
import { MovieVote } from '../components/MovieVote';
import { RateMovieModal } from '../components/RateMovieModal';
import type { MovieRatingResponse } from '../models';
import { useMovieDetailsStore } from '../stores/useMovieDetailsStore';
import { useMovieRatingStore } from '../stores/useMovieRatingStore';

const MovieDetailsPage = () => {
	const { t } = useTranslation();
	const { tmdbId } = useParams<{ tmdbId: string }>();
	const navigate = useNavigate();
	const movieDetails = useMovieDetailsStore((state) => state.movieDetails);
	const movieRating = useMovieDetailsStore((state) => state.movieRating);
	const isLoading = useMovieDetailsStore((state) => state.isLoading);
	const isMovieRatingLoading = useMovieDetailsStore(
		(state) => state.isMovieRatingLoading
	);
	const loadMovieDetails = useMovieDetailsStore(
		(state) => state.loadMovieDetails
	);
	const loadMovieRating = useMovieDetailsStore(
		(state) => state.loadMovieRating
	);
	const resetMovieDetails = useMovieDetailsStore(
		(state) => state.resetMovieDetails
	);
	const setMovieRating = useMovieDetailsStore((state) => state.setMovieRating);
	const openRateModal = useMovieRatingStore((state) => state.openModal);
	const openLogDialog = useMovieLogDialogStore((state) => state.open);

	useEffect(() => {
		if (tmdbId) {
			loadMovieDetails(Number(tmdbId));
			loadMovieRating(Number(tmdbId));
		}
		return () => {
			resetMovieDetails();
		};
	}, [tmdbId, loadMovieDetails, loadMovieRating, resetMovieDetails]);

	const onRateMovieUpdated = (movieRating: MovieRatingResponse) => {
		if (tmdbId) {
			setMovieRating(movieRating);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="text-lg text-gray-600">
					{t('MovieDetailsPage.loading')}
				</div>
			</div>
		);
	}

	if (!movieDetails) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-4">
				<div className="text-lg text-gray-600">
					{t('MovieDetailsPage.notFound')}
				</div>
				<button
					onClick={() => navigate(-1)}
					className="text-blue-500 hover:underline"
				>
					{t('MovieDetailsPage.goBack')}
				</button>
			</div>
		);
	}

	const {
		title,
		posterPath,
		backdropPath,
		releaseDate,
		runtime,
		voteAverage,
		overview,
		genres,
		tagline,
	} = movieDetails;

	return (
		<>
			<title>{t('MovieDetailsPage.pageTitle', { title })}</title>
			<div className="flex flex-col h-full overflow-y-auto">
				<MovieDetailsHero
					title={title}
					posterPath={posterPath}
					backdropPath={backdropPath}
					releaseDate={releaseDate}
					tagline={tagline}
				/>

				{/* Content Section */}
				<div className="px-4 md:px-8 pt-20 pb-8 space-y-6">
					{/* Mobile Tagline */}
					{tagline && (
						<p className="md:hidden text-gray-600 dark:text-gray-400 italic border-l-4 border-primary pl-3">
							{tagline}
						</p>
					)}

					{/* Meta Data */}
					<div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
						<MovieRuntime runtime={runtime} />
						<MovieVote vote={voteAverage} source="tmdb" />

						{isMovieRatingLoading && <Skeleton className="w-16 h-4" />}

						{!isMovieRatingLoading && !movieRating && (
							<button
								onClick={() => tmdbId && openRateModal(tmdbId)}
								className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium cursor-pointer"
							>
								<Star className="w-4 h-4" />
								<span>{t('MovieDetailsPage.rate')}</span>
							</button>
						)}

						{!isMovieRatingLoading && movieRating && (
							<MovieVote
								className="cursor-pointer"
								vote={movieRating?.rating || 0}
								source="user"
								onClick={() => tmdbId && openRateModal(tmdbId, movieRating)}
							/>
						)}
						<MovieGenres genres={genres} />

						<button
							onClick={() =>
								tmdbId &&
								openLogDialog({
									prefilledMovie: { tmdbId: Number(tmdbId), title },
								})
							}
							className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-600/10 text-green-600 hover:bg-green-600/20 transition-colors font-medium cursor-pointer"
						>
							<Clapperboard className="w-4 h-4" />
							<span>{t('MovieDetailsPage.logMovie')}</span>
						</button>
					</div>

					{/* Overview */}
					<div className="space-y-2">
						<h3 className="text-lg font-bold text-gray-900 dark:text-white">
							{t('MovieDetailsPage.overview')}
						</h3>
						<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
							{overview || t('MovieDetailsPage.noOverview')}
						</p>
					</div>
				</div>
				<RateMovieModal onSuccess={onRateMovieUpdated} />
			</div>
		</>
	);
};

export default MovieDetailsPage;
