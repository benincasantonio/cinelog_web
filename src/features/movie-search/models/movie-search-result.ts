export type MovieSearchResultItem = {
	title: string;
	overview: string;
	releaseDate: string;
	posterPath: string | null;
	voteAverage: number;
	backdropPath: string | null;
	genreIds: number[];
	originalLanguage: string;
	originalTitle: string;
} & ({ id: string; movieRef: null } | { id: null; movieRef: string });

export type MovieSearchResult = {
	results: MovieSearchResultItem[];
	nextCursor: string | null;
};
