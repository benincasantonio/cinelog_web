import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMovieDetailsStore } from "../store/useMovieDetailsStore";
import { MovieDetailsHero } from "../components/MovieDetailsHero";
import { MovieGenres } from "../components/MovieGenres";
import { MovieVote } from "../components/MovieVote";
import { MovieRuntime } from "../components/MovieRuntime";
import { RateMovieModal } from "../components/RateMovieModal";
import { useMovieRatingStore } from "../store/useMovieRatingStore";
import { Star } from "lucide-react";
import { Skeleton } from "@antoniobenincasa/ui";

const MovieDetailsPage = () => {
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
  const openRateModal = useMovieRatingStore((state) => state.openModal);

  useEffect(() => {
    if (tmdbId) {
      loadMovieDetails(Number(tmdbId));
      loadMovieRating(Number(tmdbId));
    }
    return () => {
      resetMovieDetails();
    };
  }, [tmdbId, loadMovieDetails, loadMovieRating, resetMovieDetails]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg text-gray-600">Loading movie details...</div>
      </div>
    );
  }

  if (!movieDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-lg text-gray-600">Movie not found.</div>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:underline"
        >
          Go back
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
          {isMovieRatingLoading ? (
            <Skeleton className="w-16 h-4" />
          ) : (
            <MovieVote vote={movieRating?.rating || 0} source="user" />
          )}
          <MovieGenres genres={genres} />
          <button
            onClick={() => tmdbId && openRateModal(tmdbId)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium cursor-pointer"
          >
            <Star className="w-4 h-4" />
            <span>Rate</span>
          </button>
        </div>

        {/* Overview */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Overview
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {overview || "No overview available for this movie."}
          </p>
        </div>
      </div>
      <RateMovieModal />
    </div>
  );
};

export default MovieDetailsPage;
