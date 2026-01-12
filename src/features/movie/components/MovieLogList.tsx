import type { LogListItem } from "@/features/logs/models";
import { MovieLogItem } from "./MovieLogItem";
import { useTranslation } from "react-i18next";

interface MovieLogListProps {
  logs: LogListItem[];
}

export const MovieLogList = ({ logs }: MovieLogListProps) => {
  const { t } = useTranslation();

  if (logs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">{t("MovieLogList.noMovies")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 gap-2">
      <h3 className="px-2 py-2 text-sm font-bold text-gray-700 dark:text-gray-500 uppercase tracking-wider mb-2">
        {t("MovieLogList.watchedMovie", { count: logs.length })}
      </h3>
      {logs.map((log) => (
        <MovieLogItem key={log.id} log={log} />
      ))}
    </div>
  );
};
