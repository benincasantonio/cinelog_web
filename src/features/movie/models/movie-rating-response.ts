export interface MovieRatingResponse {
	id: string;
	userId: string;
	movieId: string;
	tmdbId: string;
	rating: number;
	comment: string | null;
	createdAt: string;
	updatedAt: string;
}
