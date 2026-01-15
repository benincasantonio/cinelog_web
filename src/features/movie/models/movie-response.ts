export interface MovieResponse {
	id: string;
	title: string;
	tmdbId: number;
	posterPath?: string | null;
	releaseDate?: string | null;
	overview?: string | null;
	voteAverage?: number | null;
	runtime?: number | null;
	originalLanguage?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}
