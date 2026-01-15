export interface TMDBMovieSearchResultItem {
	id: number;
	title: string;
	overview: string;
	releaseDate: string;
	posterPath: string | null;
	voteAverage: number;
	backdropPath: string | null;
	genreIds: number[];
	originalLanguage: string;
	originalTitle: string;
}

export interface TMDBMovieSearchResult {
	page: number;
	totalResults: number;
	totalPages: number;
	results: TMDBMovieSearchResultItem[];
}
