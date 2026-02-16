import { create } from 'zustand';
import {
	login,
	logout,
	register,
} from '@/features/auth/repositories/auth-repository';
import type { RegisterRequest } from '../models/register-request';
import type { UserResponse } from '../models/user-response';
import { getUserInfo } from '../repositories/user-repository';

export const useAuthStore = create<{
	isAuthenticated: boolean;
	isInitialized: boolean;
	userInfo: UserResponse | null;
	isUserInfoLoading: boolean;
	setIsAuthenticated: (isAuthenticated: boolean) => void;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	initializeAuth: () => Promise<void>;
	register: (request: RegisterRequest) => Promise<void>;
	fetchUserInfo: () => Promise<void>;
}>((set, get) => ({
	isAuthenticated: false,
	isInitialized: false,
	userInfo: null,
	isUserInfoLoading: false,
	setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
	login: async (email: string, password: string) => {
		try {
			await login(email, password);
			set({ isAuthenticated: true });
			await get().fetchUserInfo();
		} catch (error) {
			console.error(error);
			set({ isAuthenticated: false });
			throw error;
		}
	},
	logout: async () => {
		try {
			await logout();
			set({ isAuthenticated: false, userInfo: null });
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
			set({ userInfo, isAuthenticated: true });
		} catch (error) {
			console.error(error);
			set({ isAuthenticated: false, userInfo: null });
		} finally {
			set({ isUserInfoLoading: false });
		}
	},
	initializeAuth: async () => {
		try {
			await get().fetchUserInfo();
		} catch (error) {
			console.error(error);
		} finally {
			set({ isInitialized: true });
		}
	},
}));
