import type { WatchedWhere } from './watched-where';

export type LogCreateRequest = {
	tmdbId: number;
	dateWatched: string;
	movieId?: string | null;
	viewingNotes?: string | null;
	posterPath?: string | null;
	watchedWhere?: WatchedWhere | null;
};
