import { create } from "zustand";
import { createOrUpdateRating } from "../repositories/movie-rating-repository";

interface MovieRatingState {
  isOpen: boolean;
  isLoading: boolean;
  tmdbId: string | null;
  openModal: (tmdbId: string) => void;
  closeModal: () => void;
  setIsOpen: (isOpen: boolean) => void;
  submitRating: (rating: number, comment?: string) => Promise<void>;
}

export const useMovieRatingStore = create<MovieRatingState>((set, get) => ({
  isOpen: false,
  isLoading: false,
  tmdbId: null,
  openModal: (tmdbId) => set({ isOpen: true, tmdbId }),
  closeModal: () => set({ isOpen: false, tmdbId: null }),
  setIsOpen: (isOpen) => set({ isOpen }),
  submitRating: async (rating, comment) => {
    const { tmdbId } = get();
    if (!tmdbId) return;

    set({ isLoading: true });
    try {
      await createOrUpdateRating({
        tmdbId,
        rating,
        comment: comment?.trim() || null,
      });
      set({ isOpen: false });
    } catch (error) {
      console.error("Failed to rate movie", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
