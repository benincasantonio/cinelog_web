import type { MovieResponse } from '@/features/movie/models';
import type { WatchedWhere } from './watched-where';

export type LogListItem = {
	id: string;
	movieId: string;
	tmdbId: number;
	dateWatched: string;
	viewingNotes?: string;
	posterPath?: string;
	watchedWhere?: WatchedWhere;
	movie?: MovieResponse;
	movieRating?: number | null;
};
