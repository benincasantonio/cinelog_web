export type MovieRatingResponse = {
	id: string;
	userId: string;
	movieId: string;
	rating: number;
	comment: string | null;
	createdAt: string;
	updatedAt: string;
};
