import { Button } from '@antoniobenincasa/ui';
import { useTranslation } from 'react-i18next';
import { STATS_FILTER_PRESETS } from '../models/stats-filter-preset';
import { useStatsStore } from '../stores';

export const StatsFilterPresets = () => {
	const { t } = useTranslation();
	const activePreset = useStatsStore((state) => state.activePreset());
	const applyPreset = useStatsStore((state) => state.applyPreset);

	return (
		<div className="w-full flex items-center gap-1 overflow-x-auto pb-1">
			{STATS_FILTER_PRESETS.map((preset) => (
				<Button
					key={preset.key}
					type="button"
					size="sm"
					variant={activePreset === preset.key ? 'default' : 'outline'}
					onClick={() => applyPreset(preset.key)}
					data-testid={`preset-${preset.key}`}
					data-active={activePreset === preset.key}
				>
					{t(`StatsFilter.${preset.key}`)}
				</Button>
			))}
		</div>
	);
};
