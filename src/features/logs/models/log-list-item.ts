import type { MovieResponse } from "@/features/movie/models";

export type LogListItem = {
  id: string;
  movieId: string;
  tmdbId: number;
  dateWatched: string;
  viewingNotes?: string;
  posterPath?: string;
  watchedWhere?: string;
  movie?: MovieResponse;
  movieRating?: number | null;
};
