export type LogCreateResponse = {
	id: string;
	movieId: string;
	tmdbId: number;
	dateWatched: string;
	viewingNotes?: string;
	posterPath?: string;
	watchedWhere?: string;
};
