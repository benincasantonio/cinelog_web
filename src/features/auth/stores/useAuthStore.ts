import { create } from "zustand";

export const useAuthStore = create<{
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}>((set: (state: { isAuthenticated: boolean }) => void) => ({
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
}));
