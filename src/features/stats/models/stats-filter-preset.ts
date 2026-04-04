const currentYear = new Date().getFullYear();

export const STATS_FILTER_PRESETS = [
	{ key: 'allTime', from: undefined, to: undefined },
	{ key: 'thisYear', from: currentYear, to: currentYear },
	{ key: 'lastYear', from: currentYear - 1, to: currentYear - 1 },
	{ key: 'last5Years', from: currentYear - 5, to: currentYear },
] as const;

export type StatsFilterPreset = (typeof STATS_FILTER_PRESETS)[number]['key'];

export interface StatsFilterPresetConfig {
	key: StatsFilterPreset;
	from: number | undefined;
	to: number | undefined;
}
