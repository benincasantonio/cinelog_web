import { create } from "zustand";
import { type TMDBMovieDetails } from "../models/tmdb-movie-details";
import { getDetails } from "../repositories/movies-repository";

interface MovieDetailsStore {
  movieDetails: TMDBMovieDetails | undefined;
  isLoading: boolean;

  loadMovieDetails: (tmdbId: number) => Promise<void>;
  resetMovieDetails: () => void;
}

export const useMovieDetailsStore = create<MovieDetailsStore>((set) => {
  return {
    movieDetails: undefined,
    isLoading: false,

    loadMovieDetails: async (tmdbId: number) => {
      set({ isLoading: true, movieDetails: undefined });
      try {
        const details = await getDetails(tmdbId);
        set({ movieDetails: details, isLoading: false });
      } catch (error) {
        console.error("Error loading movie details:", error);
        set({ isLoading: false });
      }
    },
    resetMovieDetails: () => {
      set({ movieDetails: undefined });
    },
  };
});
