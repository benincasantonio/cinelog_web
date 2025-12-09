import { login } from "@/lib/api/auth-service";
import { create } from "zustand";
import { onAuthStateChanged, type Unsubscribe } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const useAuthStore = create<{
  isAuthenticated: boolean;
  isInitialized: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  initializeAuth: () => Unsubscribe;
}>((set) => ({
  isAuthenticated: false,
  isInitialized: false,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  login: async (email: string, password: string) => {
    try {
      await login(email, password);
      set({ isAuthenticated: true });
    } catch (error) {
      console.error(error);
      set({ isAuthenticated: false });
    }
  },
  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({
        isAuthenticated: !!user,
        isInitialized: true,
      });
    });
    return unsubscribe;
  },
}));
