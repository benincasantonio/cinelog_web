import { create } from "zustand";

type CreateMovieLogDialogStore = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  open: () => void;
  close: () => void;
};

export const useCreateMovieLogDialogStore = create<CreateMovieLogDialogStore>(
  (set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
  })
);

