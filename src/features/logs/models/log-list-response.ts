import type { LogListItem } from './log-list-item';

export type LogListResponse = {
	logs: LogListItem[];
	totalWatches: number;
	uniqueTitles: number;
	totalRewatches: number;
};
