import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { humanizeMinutes } from '@/lib/utilities/date-utils';
import { useStatsStore } from '../store/useStatsStore';
import { StatsCard } from './StatsCard';
import { WatchMethodPieChart } from './WatchMethodPieChart';

export const Stats = () => {
	const { stats, isLoading, error, fetchStats } = useStatsStore();
	const { t, i18n } = useTranslation();

	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	const humanizedValue = humanizeMinutes(
		stats?.summary?.totalMinutes ?? 0,
		i18n.language
	);

	if (isLoading) {
		return <div>{t('Stats.loading')}</div>;
	}

	if (error) {
		return <div className="text-red-500">Error: {error}</div>;
	}

	if (!stats) {
		return <div>{t('Stats.noStats')}</div>;
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatsCard
					title={t('Stats.totalWatched')}
					value={stats.summary.totalWatches}
				/>
				<StatsCard
					title={t('Stats.uniqueTitles')}
					value={stats.summary.uniqueTitles}
				/>
				<StatsCard
					title={t('Stats.totalRewatches')}
					value={stats.summary.totalRewatches}
				/>
				<StatsCard title={t('Stats.timeWatched')} value={humanizedValue} />
				<StatsCard
					title={t('Stats.averageRating')}
					value={stats.summary.voteAverage.toFixed(1)}
				/>
			</div>
			<WatchMethodPieChart byMethod={stats.distribution.byMethod} />
		</div>
	);
};
