import { useEffect, useState } from "react";
import { getLogs, type GetLogsParams } from "@/features/logs/repositories";
import type { LogListItem } from "@/features/logs/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@antoniobenincasa/ui";
import { MoviesWatchedLoading } from "./MoviesWatchedLoading";
import { MovieVote } from "./MovieVote";

export const MoviesWatched = () => {
  const [logs, setLogs] = useState<LogListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params: GetLogsParams = {};

        if (selectedYear !== "all") {
          params.dateWatchedFrom = `${selectedYear}-01-01`;
          params.dateWatchedTo = `${selectedYear}-12-31`;
        }

        const response = await getLogs(params);
        setLogs(response.logs);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load movies");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [selectedYear]);

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
      {/* Year Filter */}
      <div className="p-4 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Year:
          </label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Movies List */}
      {logs.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No movies watched yet</p>
        </div>
      ) : (
        <div className="flex flex-col p-4 gap-2">
          <h3 className="px-2 py-2 text-sm font-bold text-gray-700 dark:text-gray-500 uppercase tracking-wider mb-2">
            {logs.length} {logs.length === 1 ? "Movie" : "Movies"} Watched
          </h3>
          {logs.map((log) => (
            <div
              key={log.id}
              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10"
            >
              <div
                className="w-[60px] h-[90px] shrink-0 rounded-lg bg-cover bg-center shadow-md group-hover:shadow-lg transition-shadow"
                style={{
                  backgroundImage: log.posterPath
                    ? `url(https://image.tmdb.org/t/p/w200${log.posterPath})`
                    : undefined,
                }}
              >
                {!log.posterPath && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-400 dark:text-gray-600 text-xs">
                      No Image
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h4 className="text-lg text-left font-bold text-gray-900 dark:text-white truncate">
                  {log.movie?.title || "Unknown Title"}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>
                    Watched: {new Date(log.dateWatched).toLocaleDateString()}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
