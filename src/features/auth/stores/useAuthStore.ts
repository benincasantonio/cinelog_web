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
	csrfToken: string | null;
	userInfo: UserResponse | null;
	isUserInfoLoading: boolean;
	setIsAuthenticated: (isAuthenticated: boolean) => void;
	setCsrfToken: (csrfToken: string | null) => void;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	initializeAuth: () => Promise<void>;
	register: (request: RegisterRequest) => Promise<void>;
	fetchUserInfo: () => Promise<void>;
}>((set, get) => ({
	isAuthenticated: false,
	isInitialized: false,
	csrfToken: null,
	userInfo: null,
	isUserInfoLoading: false,
	setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
	setCsrfToken: (csrfToken: string | null) => set({ csrfToken }),
	login: async (email: string, password: string) => {
		try {
			const response = await login(email, password);
			set({ isAuthenticated: true, csrfToken: response.csrfToken });
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
			set({ isAuthenticated: false, userInfo: null, csrfToken: null });
		} catch (error) {
			console.error(error);
		}
	},
	register: async (request: RegisterRequest) => {
		try {
			await register(request);
		} catch (error) {
			console.error(error);
			throw error;
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
