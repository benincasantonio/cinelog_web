export type MovieRatingCreateUpdateRequest = {
	movieId: string;
	rating: number;
	comment?: string | null;
};
