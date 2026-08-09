import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoist mock functions so they are safe to reference inside vi.mock factories.
// vi.mock calls are hoisted to the top of the file by Vitest, which means any
// plain `const` declared BEFORE them is not yet initialised at that point.
// vi.hoisted() is the official solution for this.
// ---------------------------------------------------------------------------

const {
	mockLogin,
	mockLogout,
	mockRegister,
	mockSendRegistrationCode,
	mockFetchCsrfToken,
	mockGetUserInfo,
	mockUpdateLocale,
	mockChangeLanguage,
	mockGetActiveLocale,
} = vi.hoisted(() => ({
	mockLogin: vi.fn(),
	mockLogout: vi.fn(),
	mockRegister: vi.fn(),
	mockSendRegistrationCode: vi.fn(),
	mockFetchCsrfToken: vi.fn(),
	mockGetUserInfo: vi.fn(),
	mockUpdateLocale: vi.fn(),
	mockChangeLanguage: vi.fn(),
	mockGetActiveLocale: vi.fn(),
}));

vi.mock('@/features/auth/repositories/auth-repository', () => ({
	login: mockLogin,
	logout: mockLogout,
	register: mockRegister,
	sendRegistrationCode: mockSendRegistrationCode,
	fetchCsrfToken: mockFetchCsrfToken,
}));

vi.mock('../repositories/user-repository', () => ({
	getUserInfo: mockGetUserInfo,
	updateLocale: mockUpdateLocale,
}));

vi.mock('@/lib/locales/i18n', () => ({
	changeActiveLocale: mockChangeLanguage,
	getActiveLocale: mockGetActiveLocale,
}));

// ---------------------------------------------------------------------------
// Import AFTER mocks are declared
// ---------------------------------------------------------------------------

import { useAuthStore } from './useAuthStore';

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const mockUser = {
	id: 'user-123',
	firstName: 'John',
	lastName: 'Doe',
	email: 'john@example.com',
	handle: 'johndoe',
	dateOfBirth: '1990-01-01',
	bio: 'A test user',
	locale: 'en-US' as const,
};

const mockLoginResponse = {
	userId: 'user-123',
	email: 'john@example.com',
	firstName: 'John',
	lastName: 'Doe',
	handle: 'johndoe',
	bio: null,
	locale: 'en-US' as const,
	csrfToken: 'login-csrf-token',
};

const mockCsrfResponse = { csrfToken: 'fresh-csrf-token' };

const mockRegisterRequest = {
	firstName: 'Jane',
	lastName: 'Doe',
	email: 'jane@example.com',
	password: 'secret',
	handle: 'janedoe',
	dateOfBirth: '1992-05-15',
	locale: 'fr-FR' as const,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resets the store back to its initial state between tests.
 * Zustand persists state across test runs if using the same store instance.
 */
function resetStore() {
	useAuthStore.setState({
		isInitialized: false,
		csrfToken: null,
		userInfo: null,
		isUserInfoLoading: false,
		isLocaleUpdating: false,
		authenticatedStatus: null,
	});
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('useAuthStore', () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
		vi.clearAllMocks();
		resetStore();
		mockChangeLanguage.mockResolvedValue(undefined);
		mockGetActiveLocale.mockReturnValue('en-US');
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	// -------------------------------------------------------------------------
	// Initial state
	// -------------------------------------------------------------------------

	describe('initial state', () => {
		it('should have the correct default values', () => {
			const state = useAuthStore.getState();

			expect(state.isInitialized).toBe(false);
			expect(state.csrfToken).toBeNull();
			expect(state.userInfo).toBeNull();
			expect(state.isUserInfoLoading).toBe(false);
			expect(state.isLocaleUpdating).toBe(false);
			expect(state.authenticatedStatus).toBeNull();
		});
	});

	// -------------------------------------------------------------------------
	// setAuthenticatedStatus
	// -------------------------------------------------------------------------

	describe('setAuthenticatedStatus', () => {
		it('should set authenticatedStatus to true', () => {
			useAuthStore.getState().setAuthenticatedStatus(true);

			expect(useAuthStore.getState().authenticatedStatus).toBe(true);
		});

		it('should set authenticatedStatus to false', () => {
			useAuthStore.getState().setAuthenticatedStatus(false);

			expect(useAuthStore.getState().authenticatedStatus).toBe(false);
		});

		it('should reset authenticatedStatus to null', () => {
			useAuthStore.setState({ authenticatedStatus: true });

			useAuthStore.getState().setAuthenticatedStatus(null);

			expect(useAuthStore.getState().authenticatedStatus).toBeNull();
		});
	});

	// -------------------------------------------------------------------------
	// setCsrfToken
	// -------------------------------------------------------------------------

	describe('setCsrfToken', () => {
		it('should set csrfToken to a given value', () => {
			useAuthStore.getState().setCsrfToken('my-token');

			expect(useAuthStore.getState().csrfToken).toBe('my-token');
		});

		it('should clear csrfToken when set to null', () => {
			useAuthStore.setState({ csrfToken: 'old-token' });

			useAuthStore.getState().setCsrfToken(null);

			expect(useAuthStore.getState().csrfToken).toBeNull();
		});
	});

	// -------------------------------------------------------------------------
	// login
	// -------------------------------------------------------------------------

	describe('login', () => {
		it('should set authenticatedStatus to true and csrfToken on success', async () => {
			mockLogin.mockResolvedValueOnce(mockLoginResponse);
			mockGetUserInfo.mockResolvedValueOnce(mockUser);
			mockFetchCsrfToken.mockResolvedValueOnce(mockCsrfResponse);

			await useAuthStore.getState().login('john@example.com', 'password');

			const state = useAuthStore.getState();
			expect(state.authenticatedStatus).toBe(true);
			// csrfToken is overwritten by fetchUserInfo → fetchCsrfToken
			expect(state.csrfToken).toBe('fresh-csrf-token');
		});

		it('should call fetchUserInfo after a successful login', async () => {
			mockLogin.mockResolvedValueOnce(mockLoginResponse);
			mockGetUserInfo.mockResolvedValueOnce(mockUser);
			mockFetchCsrfToken.mockResolvedValueOnce(mockCsrfResponse);

			await useAuthStore.getState().login('john@example.com', 'password');

			expect(mockGetUserInfo).toHaveBeenCalledTimes(1);
		});

		it('should populate userInfo after a successful login', async () => {
			mockLogin.mockResolvedValueOnce(mockLoginResponse);
			mockGetUserInfo.mockResolvedValueOnce(mockUser);
			mockFetchCsrfToken.mockResolvedValueOnce(mockCsrfResponse);

			await useAuthStore.getState().login('john@example.com', 'password');

			expect(useAuthStore.getState().userInfo).toEqual(mockUser);
		});

		it('should set authenticatedStatus to false when login throws', async () => {
			mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

			await expect(
				useAuthStore.getState().login('bad@example.com', 'wrong')
			).rejects.toThrow('Invalid credentials');

			expect(useAuthStore.getState().authenticatedStatus).toBe(false);
		});

		it('should re-throw errors so callers can handle them', async () => {
			const error = new Error('Network error');
			mockLogin.mockRejectedValueOnce(error);

			await expect(
				useAuthStore.getState().login('john@example.com', 'password')
			).rejects.toThrow('Network error');
		});

		it('should not mutate userInfo when login fails', async () => {
			useAuthStore.setState({ userInfo: null });
			mockLogin.mockRejectedValueOnce(new Error('fail'));

			await expect(
				useAuthStore.getState().login('john@example.com', 'password')
			).rejects.toThrow();

			expect(useAuthStore.getState().userInfo).toBeNull();
		});

		it('should set authenticatedStatus to false when login succeeds but fetchUserInfo fails', async () => {
			mockLogin.mockResolvedValueOnce(mockLoginResponse);
			mockGetUserInfo.mockRejectedValueOnce(new Error('Failed to get user'));
			// fetchCsrfToken is NOT called because getUserInfo throws first

			// fetchUserInfo() catches its own error and never re-throws it — so
			// login() resolves normally even though user info could not be loaded.
			await expect(
				useAuthStore.getState().login('john@example.com', 'password')
			).resolves.toBeUndefined();

			// fetchUserInfo's error handler sets authenticatedStatus to false
			expect(useAuthStore.getState().authenticatedStatus).toBe(false);
			expect(useAuthStore.getState().userInfo).toBeNull();
			expect(useAuthStore.getState().csrfToken).toBeNull();
		});
	});

	// -------------------------------------------------------------------------
	// logout
	// -------------------------------------------------------------------------

	describe('logout', () => {
		it('should clear authenticatedStatus, userInfo and csrfToken on success', async () => {
			useAuthStore.setState({
				authenticatedStatus: true,
				userInfo: mockUser,
				csrfToken: 'some-token',
			});
			mockLogout.mockResolvedValueOnce(undefined);

			await useAuthStore.getState().logout();

			const state = useAuthStore.getState();
			expect(state.authenticatedStatus).toBe(false);
			expect(state.userInfo).toBeNull();
			expect(state.csrfToken).toBeNull();
		});

		it('should not throw even when the logout API call fails', async () => {
			mockLogout.mockRejectedValueOnce(new Error('Server error'));

			await expect(useAuthStore.getState().logout()).resolves.toBeUndefined();
		});

		it('should not clear state when the logout API call fails', async () => {
			useAuthStore.setState({
				authenticatedStatus: true,
				userInfo: mockUser,
				csrfToken: 'some-token',
			});
			mockLogout.mockRejectedValueOnce(new Error('Server error'));

			await useAuthStore.getState().logout();

			// State is NOT reset when logout fails — the error is silently caught
			const state = useAuthStore.getState();
			expect(state.authenticatedStatus).toBe(true);
			expect(state.userInfo).toEqual(mockUser);
			expect(state.csrfToken).toBe('some-token');
		});

		it('should call the logout repository function exactly once', async () => {
			mockLogout.mockResolvedValueOnce(undefined);

			await useAuthStore.getState().logout();

			expect(mockLogout).toHaveBeenCalledTimes(1);
		});
	});

	// -------------------------------------------------------------------------
	// register
	// -------------------------------------------------------------------------

	describe('register', () => {
		it('should call the register repository with the provided request', async () => {
			mockRegister.mockResolvedValueOnce(undefined);

			await useAuthStore.getState().register(mockRegisterRequest);

			expect(mockRegister).toHaveBeenCalledWith(mockRegisterRequest);
		});

		it('should resolve without changing auth-related state', async () => {
			mockRegister.mockResolvedValueOnce(undefined);

			await useAuthStore.getState().register(mockRegisterRequest);

			const state = useAuthStore.getState();
			expect(state.authenticatedStatus).toBeNull();
			expect(state.userInfo).toBeNull();
			expect(state.csrfToken).toBeNull();
		});

		it('should re-throw errors from the register API', async () => {
			mockRegister.mockRejectedValueOnce(new Error('Email already taken'));

			await expect(
				useAuthStore.getState().register(mockRegisterRequest)
			).rejects.toThrow('Email already taken');
		});

		it('should re-throw non-Error exceptions', async () => {
			mockRegister.mockRejectedValueOnce('Unknown failure');

			await expect(
				useAuthStore.getState().register(mockRegisterRequest)
			).rejects.toBe('Unknown failure');
		});
	});

	// -------------------------------------------------------------------------
	// sendRegistrationCode
	// -------------------------------------------------------------------------

	describe('sendRegistrationCode', () => {
		it('should call the repository with the provided request', async () => {
			mockSendRegistrationCode.mockResolvedValueOnce(undefined);

			await useAuthStore
				.getState()
				.sendRegistrationCode({ email: 'jane@example.com' });

			expect(mockSendRegistrationCode).toHaveBeenCalledWith({
				email: 'jane@example.com',
			});
		});

		it('should resolve without changing auth-related state', async () => {
			mockSendRegistrationCode.mockResolvedValueOnce(undefined);

			await useAuthStore
				.getState()
				.sendRegistrationCode({ email: 'jane@example.com' });

			const state = useAuthStore.getState();
			expect(state.authenticatedStatus).toBeNull();
			expect(state.userInfo).toBeNull();
			expect(state.csrfToken).toBeNull();
		});

		it('should re-throw errors from the repository', async () => {
			mockSendRegistrationCode.mockRejectedValueOnce(
				new Error('Too many requests')
			);

			await expect(
				useAuthStore
					.getState()
					.sendRegistrationCode({ email: 'jane@example.com' })
			).rejects.toThrow('Too many requests');
		});
	});

	// -------------------------------------------------------------------------
	// fetchUserInfo
	// -------------------------------------------------------------------------

	describe('fetchUserInfo', () => {
		it('should set isUserInfoLoading to true during the request', async () => {
			let capturedLoading: boolean | undefined;

			mockGetUserInfo.mockImplementationOnce(async () => {
				capturedLoading = useAuthStore.getState().isUserInfoLoading;
				return mockUser;
			});
			mockFetchCsrfToken.mockResolvedValueOnce(mockCsrfResponse);

			await useAuthStore.getState().fetchUserInfo();

			expect(capturedLoading).toBe(true);
		});

		it('should reset isUserInfoLoading to false after a successful fetch', async () => {
			mockGetUserInfo.mockResolvedValueOnce(mockUser);
			mockFetchCsrfToken.mockResolvedValueOnce(mockCsrfResponse);

			await useAuthStore.getState().fetchUserInfo();

			expect(useAuthStore.getState().isUserInfoLoading).toBe(false);
		});

		it('should reset isUserInfoLoading to false even when the fetch fails', async () => {
			mockGetUserInfo.mockRejectedValueOnce(new Error('Unauthorized'));

			await useAuthStore.getState().fetchUserInfo();

			expect(useAuthStore.getState().isUserInfoLoading).toBe(false);
		});

		it('should populate userInfo and set authenticatedStatus to true on success', async () => {
			mockGetUserInfo.mockResolvedValueOnce(mockUser);
			mockFetchCsrfToken.mockResolvedValueOnce(mockCsrfResponse);

			await useAuthStore.getState().fetchUserInfo();

			const state = useAuthStore.getState();
			expect(state.userInfo).toEqual(mockUser);
			expect(state.authenticatedStatus).toBe(true);
		});

		it('should refresh the csrfToken from the CSRF endpoint on success', async () => {
			mockGetUserInfo.mockResolvedValueOnce(mockUser);
			mockFetchCsrfToken.mockResolvedValueOnce({ csrfToken: 'brand-new-csrf' });

			await useAuthStore.getState().fetchUserInfo();

			expect(useAuthStore.getState().csrfToken).toBe('brand-new-csrf');
		});

		it('should set isInitialized to true on success', async () => {
			mockGetUserInfo.mockResolvedValueOnce(mockUser);
			mockFetchCsrfToken.mockResolvedValueOnce(mockCsrfResponse);

			await useAuthStore.getState().fetchUserInfo();

			expect(useAuthStore.getState().isInitialized).toBe(true);
		});

		it('should set isInitialized to true even when the fetch fails', async () => {
			mockGetUserInfo.mockRejectedValueOnce(new Error('Unauthorized'));

			await useAuthStore.getState().fetchUserInfo();

			expect(useAuthStore.getState().isInitialized).toBe(true);
		});

		it('should clear userInfo and csrfToken when getUserInfo fails', async () => {
			useAuthStore.setState({
				userInfo: mockUser,
				csrfToken: 'stale-token',
			});
			mockGetUserInfo.mockRejectedValueOnce(new Error('Unauthorized'));

			await useAuthStore.getState().fetchUserInfo();

			const state = useAuthStore.getState();
			expect(state.userInfo).toBeNull();
			expect(state.csrfToken).toBeNull();
		});

		it('should set authenticatedStatus to false when getUserInfo fails', async () => {
			mockGetUserInfo.mockRejectedValueOnce(new Error('Unauthorized'));

			await useAuthStore.getState().fetchUserInfo();

			expect(useAuthStore.getState().authenticatedStatus).toBe(false);
		});

		it('should clear userInfo and csrfToken when fetchCsrfToken fails', async () => {
			useAuthStore.setState({
				userInfo: mockUser,
				csrfToken: 'stale-token',
			});
			mockGetUserInfo.mockResolvedValueOnce(mockUser);
			mockFetchCsrfToken.mockRejectedValueOnce(new Error('CSRF fetch failed'));

			await useAuthStore.getState().fetchUserInfo();

			const state = useAuthStore.getState();
			expect(state.userInfo).toBeNull();
			expect(state.csrfToken).toBeNull();
			expect(state.authenticatedStatus).toBe(false);
		});

		it('should NOT throw even when the fetch fails', async () => {
			mockGetUserInfo.mockRejectedValueOnce(new Error('oops'));

			await expect(
				useAuthStore.getState().fetchUserInfo()
			).resolves.toBeUndefined();
		});

		it('should call getUserInfo before fetchCsrfToken', async () => {
			const callOrder: string[] = [];
			mockGetUserInfo.mockImplementationOnce(async () => {
				callOrder.push('getUserInfo');
				return mockUser;
			});
			mockChangeLanguage.mockImplementationOnce(async () => {
				callOrder.push('changeLanguage');
			});
			mockFetchCsrfToken.mockImplementationOnce(async () => {
				callOrder.push('fetchCsrfToken');
				return mockCsrfResponse;
			});

			await useAuthStore.getState().fetchUserInfo();

			expect(callOrder).toEqual([
				'getUserInfo',
				'changeLanguage',
				'fetchCsrfToken',
			]);
			expect(mockChangeLanguage).toHaveBeenCalledWith('en-US');
		});

		it('waits for the account locale before completing initialization', async () => {
			let resolveLanguage: (() => void) | undefined;
			mockGetUserInfo.mockResolvedValueOnce({
				...mockUser,
				locale: 'fr-FR',
			});
			mockChangeLanguage.mockReturnValueOnce(
				new Promise<void>((resolve) => {
					resolveLanguage = resolve;
				})
			);
			mockFetchCsrfToken.mockResolvedValueOnce(mockCsrfResponse);

			const fetchPromise = useAuthStore.getState().fetchUserInfo();
			await vi.waitFor(() =>
				expect(mockChangeLanguage).toHaveBeenCalledWith('fr-FR')
			);

			expect(useAuthStore.getState().isInitialized).toBe(false);

			resolveLanguage?.();
			await fetchPromise;

			expect(useAuthStore.getState().isInitialized).toBe(true);
			expect(useAuthStore.getState().userInfo?.locale).toBe('fr-FR');
		});

		it('keeps the session and detector fallback for an invalid account locale', async () => {
			mockGetActiveLocale.mockReturnValueOnce('it-IT');
			mockGetUserInfo.mockResolvedValueOnce({
				...mockUser,
				locale: 'de-DE',
			});
			mockFetchCsrfToken.mockResolvedValueOnce(mockCsrfResponse);

			await useAuthStore.getState().fetchUserInfo();

			expect(mockChangeLanguage).toHaveBeenCalledWith('it-IT');
			expect(useAuthStore.getState().authenticatedStatus).toBe(true);
			expect(useAuthStore.getState().userInfo?.locale).toBe('it-IT');
			expect(consoleErrorSpy).toHaveBeenCalled();
		});
	});

	describe('updateLocale', () => {
		it('persists before changing i18n and account state', async () => {
			const callOrder: string[] = [];
			useAuthStore.setState({ userInfo: mockUser });
			mockUpdateLocale.mockImplementationOnce(async () => {
				callOrder.push('updateLocale');
				return { locale: 'fr-FR' };
			});
			mockChangeLanguage.mockImplementationOnce(async () => {
				callOrder.push('changeLanguage');
			});

			await useAuthStore.getState().updateLocale('fr-FR');

			expect(callOrder).toEqual(['updateLocale', 'changeLanguage']);
			expect(mockUpdateLocale).toHaveBeenCalledWith('fr-FR');
			expect(useAuthStore.getState().userInfo).toEqual({
				...mockUser,
				locale: 'fr-FR',
			});
			expect(useAuthStore.getState().isLocaleUpdating).toBe(false);
		});

		it('exposes pending state until locale synchronization completes', async () => {
			let resolveUpdate: ((response: { locale: 'it-IT' }) => void) | undefined;
			useAuthStore.setState({ userInfo: mockUser });
			mockUpdateLocale.mockReturnValueOnce(
				new Promise((resolve) => {
					resolveUpdate = resolve;
				})
			);

			const updatePromise = useAuthStore.getState().updateLocale('it-IT');

			expect(useAuthStore.getState().isLocaleUpdating).toBe(true);

			resolveUpdate?.({ locale: 'it-IT' });
			await updatePromise;

			expect(useAuthStore.getState().isLocaleUpdating).toBe(false);
		});

		it('leaves account and UI state unchanged when persistence fails', async () => {
			useAuthStore.setState({ userInfo: mockUser });
			mockUpdateLocale.mockRejectedValueOnce(new Error('network'));

			await expect(
				useAuthStore.getState().updateLocale('fr-FR')
			).rejects.toThrow('network');

			expect(mockChangeLanguage).not.toHaveBeenCalled();
			expect(useAuthStore.getState().userInfo).toEqual(mockUser);
			expect(useAuthStore.getState().isLocaleUpdating).toBe(false);
		});

		it('applies the requested locale when the update response is malformed', async () => {
			useAuthStore.setState({ userInfo: mockUser });
			mockUpdateLocale.mockResolvedValueOnce({ locale: 'de-DE' });

			await useAuthStore.getState().updateLocale('fr-FR');

			expect(mockChangeLanguage).toHaveBeenCalledWith('fr-FR');
			expect(useAuthStore.getState().userInfo).toEqual({
				...mockUser,
				locale: 'fr-FR',
			});
			expect(useAuthStore.getState().isLocaleUpdating).toBe(false);
			expect(consoleErrorSpy).toHaveBeenCalled();
		});

		it('does not persist the already-active account locale', async () => {
			useAuthStore.setState({ userInfo: mockUser });

			await useAuthStore.getState().updateLocale('en-US');

			expect(mockUpdateLocale).not.toHaveBeenCalled();
			expect(mockChangeLanguage).not.toHaveBeenCalled();
		});
	});

	// -------------------------------------------------------------------------
	// updateUserInfo
	// -------------------------------------------------------------------------

	describe('updateUserInfo', () => {
		it('should update userInfo in the store', () => {
			useAuthStore.getState().updateUserInfo(mockUser);

			expect(useAuthStore.getState().userInfo).toEqual(mockUser);
		});

		it('should overwrite existing userInfo', () => {
			useAuthStore.setState({ userInfo: mockUser });
			const updatedUser = { ...mockUser, firstName: 'Janet' };

			useAuthStore.getState().updateUserInfo(updatedUser);

			expect(useAuthStore.getState().userInfo?.firstName).toBe('Janet');
		});
	});
});
