import { useTranslation } from 'react-i18next';
import type { LogListItem } from '@/features/logs/models';
import { MovieLogItem } from './MovieLogItem';

interface MovieLogListProps {
	logs: LogListItem[];
	uniqueTitles: number;
	totalRewatches: number;
	isDropdownMenuVisible?: boolean;
}

export const MovieLogList = ({
	logs,
	uniqueTitles,
	totalRewatches,
	isDropdownMenuVisible,
}: MovieLogListProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col p-4 gap-2">
			<h3 className="px-2 py-2 text-sm font-bold text-gray-700 dark:text-gray-500 uppercase tracking-wider mb-2">
				{t('MovieLogList.watchedMovie', { count: uniqueTitles })}
				{totalRewatches > 0 &&
					` - ${t('MovieLogList.rewatches', { count: totalRewatches })}`}
			</h3>
			{logs.length === 0 && (
				<div className="text-center py-16 text-gray-500 dark:text-gray-400">
					<p className="text-lg font-medium">{t('MovieLogList.noMovies')}</p>
				</div>
			)}
			{logs.map((log) => (
				<MovieLogItem
					key={log.id}
					log={log}
					isDropdownMenuVisible={isDropdownMenuVisible}
				/>
			))}
		</div>
	);
};
