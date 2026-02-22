import { create } from 'zustand';
import {
	fetchCsrfToken,
	login,
	logout,
	register,
} from '@/features/auth/repositories/auth-repository';
import type { RegisterRequest } from '../models/register-request';
import type { UserResponse } from '../models/user-response';
import { getUserInfo } from '../repositories/user-repository';

export const useAuthStore = create<{
	isInitialized: boolean;
	csrfToken: string | null;
	userInfo: UserResponse | null;
	isUserInfoLoading: boolean;
	authenticatedStatus: boolean | null;
	setAuthenticatedStatus: (status: boolean | null) => void;
	setCsrfToken: (csrfToken: string | null) => void;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	register: (request: RegisterRequest) => Promise<void>;
	fetchUserInfo: () => Promise<void>;
}>((set, get) => ({
	isInitialized: false,
	csrfToken: null,
	userInfo: null,
	authenticatedStatus: null,
	isUserInfoLoading: false,
	setAuthenticatedStatus: (status: boolean | null) =>
		set({ authenticatedStatus: status }),
	setCsrfToken: (csrfToken: string | null) => set({ csrfToken }),
	login: async (email: string, password: string) => {
		try {
			const response = await login(email, password);
			set({ authenticatedStatus: true, csrfToken: response.csrfToken });
			await get().fetchUserInfo();
		} catch (error) {
			console.error(error);
			set({ authenticatedStatus: false });
			throw error;
		}
	},
	logout: async () => {
		try {
			await logout();
			set({ authenticatedStatus: false, userInfo: null, csrfToken: null });
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

			const csrfResponse = await fetchCsrfToken();
			const csrfToken = csrfResponse.csrfToken;

			set({
				userInfo,
				authenticatedStatus: true,
				csrfToken,
				isInitialized: true,
			});
		} catch (error) {
			console.error(error);
			set({
				authenticatedStatus: false,
				userInfo: null,
				csrfToken: null,
				isInitialized: true,
			});
		} finally {
			set({ isUserInfoLoading: false });
		}
	},
}));
