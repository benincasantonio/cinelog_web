export type MovieResponse = {
	id: string;
	title: string;
	posterPath?: string | null;
	releaseDate?: string | null;
	overview?: string | null;
	voteAverage?: number | null;
	runtime?: number | null;
	originalLanguage?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
};
