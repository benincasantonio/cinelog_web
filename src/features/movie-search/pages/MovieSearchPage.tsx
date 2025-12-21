import { Input } from "@antoniobenincasa/ui";
import { MovieSearchList } from "../components";
import { useEffect, useState } from "react";
import { useMoviesStore } from "../store";

const MoviesPage = () => {
  const [query, setQuery] = useState("");
  const loadMovieSearchResults = useMoviesStore(
    (state) => state.loadMovieSearchResults
  );
  const resetMovieSearchResults = useMoviesStore(
    (state) => state.resetMovieSearchResults
  );

  useEffect(() => {
    if (!query || query.length < 3) {
      resetMovieSearchResults();
      return;
    }

    const timer = setTimeout(() => {
      loadMovieSearchResults(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Movie Search</h1>
      <Input
        placeholder="Search for movies..."
        className="mb-4"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <MovieSearchList />
    </div>
  );
};

export default MoviesPage;
