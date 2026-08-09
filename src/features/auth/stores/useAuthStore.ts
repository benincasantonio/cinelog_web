import { create } from 'zustand';
import {
	fetchCsrfToken,
	login,
	logout,
	register,
	sendRegistrationCode,
} from '@/features/auth/repositories/auth-repository';
import { changeActiveLocale, getActiveLocale } from '@/lib/locales/i18n';
import type { Locale } from '@/lib/models';
import { resolveSupportedLocale } from '@/lib/utilities/locale-utils';
import type { RegisterRequest } from '../models/register-request';
import type { SendCodeRequest } from '../models/send-code-request';
import type { UserResponse } from '../models/user-response';
import {
	getUserInfo,
	updateLocale as persistLocale,
} from '../repositories/user-repository';

export const useAuthStore = create<{
	isInitialized: boolean;
	csrfToken: string | null;
	userInfo: UserResponse | null;
	isUserInfoLoading: boolean;
	isLocaleUpdating: boolean;
	authenticatedStatus: boolean | null;
	setAuthenticatedStatus: (status: boolean | null) => void;
	setCsrfToken: (csrfToken: string | null) => void;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	register: (request: RegisterRequest) => Promise<void>;
	sendRegistrationCode: (request: SendCodeRequest) => Promise<void>;
	fetchUserInfo: () => Promise<void>;
	updateUserInfo: (userInfo: UserResponse) => void;
	updateLocale: (locale: Locale) => Promise<void>;
}>((set, get) => ({
	isInitialized: false,
	csrfToken: null,
	userInfo: null,
	authenticatedStatus: null,
	isUserInfoLoading: false,
	isLocaleUpdating: false,
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
			set({
				authenticatedStatus: false,
				userInfo: null,
				csrfToken: null,
				isLocaleUpdating: false,
			});
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
	sendRegistrationCode: async (request: SendCodeRequest) => {
		try {
			await sendRegistrationCode(request);
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	updateUserInfo: (userInfo: UserResponse) => set({ userInfo }),
	updateLocale: async (locale: Locale) => {
		const { isLocaleUpdating, userInfo } = get();
		if (!userInfo || isLocaleUpdating || userInfo.locale === locale) return;

		set({ isLocaleUpdating: true });
		try {
			const response = await persistLocale(locale);
			const savedLocale = resolveSupportedLocale(response.locale);
			if (!savedLocale) {
				console.error(
					'The locale update response was not supported; applying the requested locale'
				);
			}

			// The PUT already persisted `locale` server-side by this point, so an
			// unparseable response body must fall back to it rather than throw —
			// throwing here would report a successful write as a failed update.
			const nextLocale = savedLocale ?? locale;

			await changeActiveLocale(nextLocale);
			set((state) => ({
				userInfo: state.userInfo
					? { ...state.userInfo, locale: nextLocale }
					: null,
			}));
		} catch (error) {
			console.error(error);
			throw error;
		} finally {
			set({ isLocaleUpdating: false });
		}
	},
	fetchUserInfo: async () => {
		set({ isUserInfoLoading: true });
		try {
			const userInfo = await getUserInfo();
			const detectedLocale = getActiveLocale();
			const accountLocale = resolveSupportedLocale(
				(userInfo as { locale?: unknown }).locale
			);
			if (!accountLocale) {
				console.error(
					'The account response did not include a supported locale; using the detected fallback'
				);
			}
			const activeLocale = accountLocale ?? detectedLocale;

			await changeActiveLocale(activeLocale);
			const csrfResponse = await fetchCsrfToken();
			const csrfToken = csrfResponse.csrfToken;

			set({
				userInfo: { ...userInfo, locale: activeLocale },
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
				isLocaleUpdating: false,
				isInitialized: true,
			});
		} finally {
			set({ isUserInfoLoading: false });
		}
	},
}));
