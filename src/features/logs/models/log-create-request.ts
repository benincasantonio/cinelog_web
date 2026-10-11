import type { WatchedWhere } from './watched-where';

export type LogCreateRequest = {
	tmdbId: number;
	dateWatched: string;
	movieId?: string | null;
	viewingNotes?: string | null;
	watchedWhere?: WatchedWhere | null;
	rating?: number | null;
};
