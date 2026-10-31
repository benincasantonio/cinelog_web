import type { WatchedWhere } from './watched-where';

export type LogCreateRequest = {
	movieId: string;
	dateWatched: string;
	viewingNotes?: string | null;
	watchedWhere?: WatchedWhere | null;
	rating?: number | null;
};
