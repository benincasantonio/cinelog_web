import type { MovieSearchResultItem } from './movie-search-result';

export const MOVIE_ID = '6f1c2a9e-5738-46f6-bfc7-4c8e518de561';
export const OTHER_MOVIE_ID = 'bf6c39c4-00da-4f47-9314-1ebeb965412a';

export const searchMovie = (
	identity: { id: string; movieRef: null } | { id: null; movieRef: string },
	title = 'Inception'
): MovieSearchResultItem => ({
	...identity,
	title,
	overview: 'A movie',
	releaseDate: '2010-07-16',
	posterPath: null,
	backdropPath: null,
	voteAverage: 8.4,
	genreIds: [1],
	originalLanguage: 'en',
	originalTitle: title,
});
