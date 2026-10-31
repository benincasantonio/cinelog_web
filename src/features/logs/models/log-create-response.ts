export type LogCreateResponse = {
	id: string;
	movieId: string;
	dateWatched: string;
	viewingNotes?: string;
	posterPath?: string;
	watchedWhere?: string;
	movieRating?: number | null;
};
