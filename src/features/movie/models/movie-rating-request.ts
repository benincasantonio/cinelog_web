export interface MovieRatingCreateUpdateRequest {
	tmdbId: string;
	rating: number;
	comment?: string | null;
}
