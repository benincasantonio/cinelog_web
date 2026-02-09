import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { humanizeMinutes } from '@/lib/utilities/date-utils';
import { useStatsStore } from '../stores/useStatsStore';
import { StatsCard } from './StatsCard';
import { StatsFilter } from './StatsFilter';
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
		return <div data-testid="stats-loading">{t('Stats.loading')}</div>;
	}

	if (error) {
		return (
			<div className="text-red-500" data-testid="stats-error">
				Error: {error}
			</div>
		);
	}

	if (!stats) {
		return <div data-testid="stats-no-data">{t('Stats.noStats')}</div>;
	}

	return (
		<div className="space-y-6">
			<StatsFilter />

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatsCard
					title={t('Stats.totalWatched')}
					value={stats.summary.totalWatches}
					testId="stat-total-watched"
				/>
				<StatsCard
					title={t('Stats.uniqueTitles')}
					value={stats.summary.uniqueTitles}
					testId="stat-unique-titles"
				/>
				<StatsCard
					title={t('Stats.totalRewatches')}
					value={stats.summary.totalRewatches}
					testId="stat-total-rewatches"
				/>
				<StatsCard
					title={t('Stats.timeWatched')}
					value={humanizedValue}
					testId="stat-time-watched"
				/>
				<StatsCard
					title={t('Stats.averageRating')}
					value={stats.summary.voteAverage?.toFixed(1) ?? 0}
					testId="stat-average-rating"
				/>
			</div>
			<WatchMethodPieChart byMethod={stats.distribution.byMethod} />
		</div>
	);
};
