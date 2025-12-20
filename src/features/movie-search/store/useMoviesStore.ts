import { create } from "zustand";
import type { TMDBMovieSearchResult } from "../models";
import { search } from "../repositories/movies-repository";

interface MoviesStore {
  movieSearchResult: TMDBMovieSearchResult | undefined;
  isLoading: boolean;
  loadMovieSearchResults: (query: string) => Promise<void>;
}

export const useMoviesStore = create<MoviesStore>((set) => {
  return {
    movieSearchResult: undefined,
    isLoading: false,

    loadMovieSearchResults: async (query: string) => {
      set({ isLoading: true });
      try {
        const results = await search(query);
        set({ movieSearchResult: results, isLoading: false });
      } catch (error) {
        console.error("Error loading movie search results:", error);
        set({ isLoading: false });
      }
    },
  };
});
