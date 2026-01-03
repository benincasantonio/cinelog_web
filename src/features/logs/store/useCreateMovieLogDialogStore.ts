import { create } from "zustand";

type PrefilledMovie = {
  tmdbId: number;
  title: string;
} | null;

type CreateMovieLogDialogStore = {
  isOpen: boolean;
  prefilledMovie: PrefilledMovie;
  setIsOpen: (isOpen: boolean) => void;
  open: (movie?: { tmdbId: number; title: string }) => void;
  close: () => void;
  clearPrefilledMovie: () => void;
};

export const useCreateMovieLogDialogStore = create<CreateMovieLogDialogStore>(
  (set) => ({
    isOpen: false,
    prefilledMovie: null,
    setIsOpen: (isOpen) => set({ isOpen, prefilledMovie: isOpen ? undefined : null }),
    open: (movie) => set({ isOpen: true, prefilledMovie: movie || null }),
    close: () => set({ isOpen: false }),
    clearPrefilledMovie: () => set({ prefilledMovie: null }),
  })
);

