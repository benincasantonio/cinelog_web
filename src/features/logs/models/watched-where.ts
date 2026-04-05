export const WATCHED_WHERE_VALUES = [
	'cinema',
	'streaming',
	'homeVideo',
	'tv',
	'other',
] as const;

export type WatchedWhere = (typeof WATCHED_WHERE_VALUES)[number];
