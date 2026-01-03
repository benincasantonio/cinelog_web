import type { LogListItem } from "@/features/logs/models";
import { MovieLogItem } from "./MovieLogItem";

interface MovieLogListProps {
  logs: LogListItem[];
}

export const MovieLogList = ({ logs }: MovieLogListProps) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">No movies watched yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 gap-2">
      <h3 className="px-2 py-2 text-sm font-bold text-gray-700 dark:text-gray-500 uppercase tracking-wider mb-2">
        {logs.length} {logs.length === 1 ? "Movie" : "Movies"} Watched
      </h3>
      {logs.map((log) => (
        <MovieLogItem key={log.id} log={log} />
      ))}
    </div>
  );
};
