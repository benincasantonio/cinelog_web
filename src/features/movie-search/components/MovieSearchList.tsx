import { useMoviesStore } from "../store/useMoviesStore";

export const MovieSearchList = () => {
  const movieSearchResult = useMoviesStore((state) => state.movieSearchResult);
  const isLoading = useMoviesStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-gray-600">Searching for movies...</div>
      </div>
    );
  }

  if (!movieSearchResult || movieSearchResult.results.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-gray-600">
          No movies found. Try searching for something!
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {movieSearchResult.results.map((movie) => (
        <div
          key={movie.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {movie.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 truncate">{movie.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {movie.overview}
            </p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">
                {movie.release_date || "N/A"}
              </span>
              <span className="font-semibold text-yellow-500">
                ★ {movie.vote_average.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
