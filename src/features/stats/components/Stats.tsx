import { useEffect } from "react";
import { useStatsStore } from "../store/useStatsStore";
import { StatsCard } from "./StatsCard";
import { WatchMethodPieChart } from "./WatchMethodPieChart";

export const Stats = () => {
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Watched" value={stats.summary.total_watches} />
        <StatsCard title="Unique Titles" value={stats.summary.unique_titles} />
        <StatsCard
          title="Total Rewatches"
          value={stats.summary.total_rewatches}
        />
        <StatsCard title="Total Minutes" value={stats.summary.total_minutes} />
        <StatsCard
          title="Average Rating"
          value={stats.summary.vote_average.toFixed(1)}
        />
      </div>
      <WatchMethodPieChart byMethod={stats.distribution.by_method} />
    </div>
  );
};
