export type StatsFilterPreset = 'allTime' | 'thisYear' | 'lastYear' | 'last5Years' | 'custom';

export interface StatsFilterPresetConfig {
	key: StatsFilterPreset;
	from: number | undefined;
	to: number | undefined;
}

const currentYear = new Date().getFullYear();

export const STATS_FILTER_PRESETS: StatsFilterPresetConfig[] = [
	{ key: 'allTime', from: undefined, to: undefined },
	{ key: 'thisYear', from: currentYear, to: currentYear },
	{ key: 'lastYear', from: currentYear - 1, to: currentYear - 1 },
	{ key: 'last5Years', from: currentYear - 5, to: currentYear },
];
