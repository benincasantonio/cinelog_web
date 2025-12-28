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
import type { UserResponse } from "../models/user-response";
import { getUserInfo } from "../repositories/user-repository";

export const useAuthStore = create<{
  isAuthenticated: boolean;
  isInitialized: boolean;
  userData: UserCredential | null;
  userInfo: UserResponse | null;
  isUserInfoLoading: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Unsubscribe;
  register: (request: RegisterRequest) => Promise<void>;
  fetchUserInfo: () => Promise<void>;
}>((set, get) => ({
  isAuthenticated: false,
  isInitialized: false,
  userData: null,
  userInfo: null,
  isUserInfoLoading: false,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  login: async (email: string, password: string) => {
    try {
      const userData = await login(email, password);
      set({ isAuthenticated: true, userData });
      await get().fetchUserInfo();
    } catch (error) {
      console.error(error);
      set({ isAuthenticated: false });
    }
  },
  logout: async () => {
    try {
      await logout();
      set({ isAuthenticated: false, userData: null, userInfo: null });
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
  fetchUserInfo: async () => {
    set({ isUserInfoLoading: true });
    try {
      const userInfo = await getUserInfo();
      set({ userInfo });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isUserInfoLoading: false });
    }
  },
  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({
        isAuthenticated: !!user,
        isInitialized: true,
      });
      if (user) {
        get().fetchUserInfo();
      }
    });
    return unsubscribe;
  },
}));
