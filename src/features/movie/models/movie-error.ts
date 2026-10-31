export const MOVIE_ERROR_VALUES = [
	'temporary',
	'invalidReference',
	'invalidCursor',
	'unavailable',
] as const;
export type MovieError = (typeof MOVIE_ERROR_VALUES)[number];
