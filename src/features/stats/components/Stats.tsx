import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { humanizeMinutes } from '@/lib/utilities/date-utils';
import { useStatsStore } from '../store/useStatsStore';
import { StatsCard } from './StatsCard';
import { WatchMethodPieChart } from './WatchMethodPieChart';

export const Stats = () => {
	const { stats, isLoading, error, fetchStats } = useStatsStore();
	const { i18n } = useTranslation();

	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	const humanizedValue = stats?.summary.totalMinutes
		? humanizeMinutes(stats.summary.totalMinutes, i18n.language)
		: 0;

	console.log(humanizedValue);
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
				<StatsCard title="Total Watched" value={stats.summary.totalWatches} />
				<StatsCard title="Unique Titles" value={stats.summary.uniqueTitles} />
				<StatsCard
					title="Total Rewatches"
					value={stats.summary.totalRewatches}
				/>
				<StatsCard title="Total Minutes" value={humanizedValue} />
				<StatsCard
					title="Average Rating"
					value={stats.summary.voteAverage.toFixed(1)}
				/>
			</div>
			<WatchMethodPieChart byMethod={stats.distribution.byMethod} />
		</div>
	);
};
