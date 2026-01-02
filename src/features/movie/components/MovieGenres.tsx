import { type TMDBGenre } from "../models/tmdb-movie-details";

interface MovieGenresProps {
  genres: TMDBGenre[];
}

export const MovieGenres = ({ genres }: MovieGenresProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((g) => (
        <span
          key={g.id}
          className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300"
        >
          {g.name}
        </span>
      ))}
    </div>
  );
};
