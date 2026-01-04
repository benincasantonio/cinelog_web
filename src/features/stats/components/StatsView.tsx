import { useEffect } from "react";
import { useStatsStore } from "../store/useStatsStore";

export const StatsView = () => {
  const { stats, isLoading, error, fetchStats } = useStatsStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return <div>Loading stats...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!stats) {
    return <div>No stats available</div>;
  }

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto">
      <pre className="text-xs text-gray-800 dark:text-gray-200">
        {JSON.stringify(stats, null, 2)}
      </pre>
    </div>
  );
};
