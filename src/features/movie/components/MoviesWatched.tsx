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
import { MovieLogList } from "./MovieLogList";

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
      <MovieLogList logs={logs} />
    </div>
  );
};
