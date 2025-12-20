export interface TMDBMovieSearchResultItem {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  backdrop_path: string | null;
  genre_ids: number[];
  original_language: string;
  original_title: string;
}

export interface TMDBMovieSearchResult {
  page: number;
  total_results: number;
  total_pages: number;
  results: TMDBMovieSearchResultItem[];
}
