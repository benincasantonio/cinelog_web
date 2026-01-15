export interface TMDBGenre {
	id: number;
	name: string;
}

export interface TMDBProductionCompany {
	id: number;
	name: string;
	logoPath: string | null;
	originCountry: string;
}

export interface TMDBProductionCountry {
	iso31661: string;
	name: string;
}

export interface TMDBSpokenLanguage {
	iso6391: string;
	name: string;
	englishName: string;
}

export interface TMDBMovieDetails {
	id: number;
	title: string;
	originalTitle: string;
	overview: string;
	releaseDate: string;
	posterPath: string | null;
	backdropPath: string | null;
	voteAverage: number;
	voteCount: number;
	runtime: number | null;
	budget: number;
	revenue: number;
	status: string;
	tagline: string | null;
	homepage: string | null;
	imdbId: string | null;
	originalLanguage: string;
	popularity: number;
	adult: boolean;
	genres: TMDBGenre[];
	productionCompanies: TMDBProductionCompany[];
	productionCountries: TMDBProductionCountry[];
	spokenLanguages: TMDBSpokenLanguage[];
}
