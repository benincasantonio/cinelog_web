import {
  login,
  logout,
  register,
} from "@/features/auth/repositories/auth-repository";
import { create } from "zustand";
import {
  onAuthStateChanged,
  type Unsubscribe,
  type UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { RegisterRequest } from "../models/register-request";

export const useAuthStore = create<{
  isAuthenticated: boolean;
  isInitialized: boolean;
  userData: UserCredential | null;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Unsubscribe;
  register: (request: RegisterRequest) => Promise<void>;
}>((set) => ({
  isAuthenticated: false,
  isInitialized: false,
  userData: null,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  login: async (email: string, password: string) => {
    try {
      const userData = await login(email, password);
      set({ isAuthenticated: true, userData });
    } catch (error) {
      console.error(error);
      set({ isAuthenticated: false });
    }
  },
  logout: async () => {
    try {
      await logout();
      set({ isAuthenticated: false, userData: null });
    } catch (error) {
      console.error(error);
    }
  },
  register: async (request: RegisterRequest) => {
    try {
      await register(request);
    } catch (error) {
      console.error(error);
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
