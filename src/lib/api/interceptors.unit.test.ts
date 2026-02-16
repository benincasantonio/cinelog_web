import type { KyRequest } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiClientOptions } from '@/lib/models/api-client-options';
import {
	afterResponseInterceptor,
	beforeRequestInterceptor,
} from './interceptors';

// Mock dependencies
vi.mock('@/lib/utils/auth.utils', () => ({
	getCsrfTokenFromCookie: vi.fn(),
}));

vi.mock('@/features/auth/repositories/auth-repository', () => ({
	refreshToken: vi.fn(),
}));

vi.mock('@/features/auth/stores', () => ({
	useAuthStore: {
		getState: vi.fn(),
	},
}));

import { refreshToken } from '@/features/auth/repositories/auth-repository';
import { useAuthStore } from '@/features/auth/stores';
import { getCsrfTokenFromCookie } from '@/lib/utils/auth.utils';

interface MockLocation {
	href: string;
}

interface MockAuthState {
	isAuthenticated: boolean;
	isInitialized: boolean;
	userInfo: null;
	isUserInfoLoading: boolean;
	setIsAuthenticated: (isAuthenticated: boolean) => void;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	initializeAuth: () => Promise<void>;
	register: (request: unknown) => Promise<void>;
	fetchUserInfo: () => Promise<void>;
}

describe('interceptors', () => {
	let originalLocation: Location;

	beforeEach(() => {
		vi.clearAllMocks();
		originalLocation = window.location;
		delete (window as { location?: Location }).location;
		window.location = { href: '' } as MockLocation & Location;
	});

	afterEach(() => {
		window.location = originalLocation;
	});

	describe('beforeRequestInterceptor', () => {
		const createMockRequest = (method: string): KyRequest => {
			return {
				method,
				headers: {
					set: vi.fn(),
				},
			} as unknown as KyRequest;
		};

		const mockOptions: ApiClientOptions = {};

		it('should add CSRF token to POST requests', async () => {
			vi.mocked(getCsrfTokenFromCookie).mockReturnValue('test-csrf-token');
			const mockRequest = createMockRequest('POST');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).toHaveBeenCalledWith(
				'X-CSRF-Token',
				'test-csrf-token'
			);
		});

		it('should add CSRF token to PUT requests', async () => {
			vi.mocked(getCsrfTokenFromCookie).mockReturnValue('test-csrf-token');
			const mockRequest = createMockRequest('PUT');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).toHaveBeenCalledWith(
				'X-CSRF-Token',
				'test-csrf-token'
			);
		});

		it('should add CSRF token to DELETE requests', async () => {
			vi.mocked(getCsrfTokenFromCookie).mockReturnValue('test-csrf-token');
			const mockRequest = createMockRequest('DELETE');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).toHaveBeenCalledWith(
				'X-CSRF-Token',
				'test-csrf-token'
			);
		});

		it('should add CSRF token to PATCH requests', async () => {
			vi.mocked(getCsrfTokenFromCookie).mockReturnValue('test-csrf-token');
			const mockRequest = createMockRequest('PATCH');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).toHaveBeenCalledWith(
				'X-CSRF-Token',
				'test-csrf-token'
			);
		});

		it('should NOT add CSRF token to GET requests', async () => {
			vi.mocked(getCsrfTokenFromCookie).mockReturnValue('test-csrf-token');
			const mockRequest = createMockRequest('GET');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).not.toHaveBeenCalled();
		});

		it('should handle lowercase method names', async () => {
			vi.mocked(getCsrfTokenFromCookie).mockReturnValue('test-csrf-token');
			const mockRequest = createMockRequest('post');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).toHaveBeenCalledWith(
				'X-CSRF-Token',
				'test-csrf-token'
			);
		});

		it('should not set header when CSRF token is null', async () => {
			vi.mocked(getCsrfTokenFromCookie).mockReturnValue(null);
			const mockRequest = createMockRequest('POST');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).not.toHaveBeenCalled();
		});
	});

	describe('afterResponseInterceptor', () => {
		const createMockRequest = (): Request => {
			return {
				url: 'https://api.example.com/test',
				method: 'GET',
			} as Request;
		};

		const createMockResponse = (status: number): Response => {
			return {
				status,
				ok: status >= 200 && status < 300,
			} as Response;
		};

		const createMockAuthState = (isAuthenticated: boolean): MockAuthState => ({
			isAuthenticated,
			isInitialized: false,
			userInfo: null,
			isUserInfoLoading: false,
			setIsAuthenticated: vi.fn(),
			login: vi.fn(),
			logout: vi.fn(),
			initializeAuth: vi.fn(),
			register: vi.fn(),
			fetchUserInfo: vi.fn(),
		});

		it('should not intercept non-401 responses', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(true)
			);

			const mockRequest = createMockRequest();
			const mockResponse = createMockResponse(200);
			const mockOptions: ApiClientOptions = {};

			await afterResponseInterceptor(mockRequest, mockOptions, mockResponse);

			expect(refreshToken).not.toHaveBeenCalled();
			expect(window.location.href).toBe('');
		});

		it('should not intercept 401 when skipAuth is true', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(true)
			);

			const mockRequest = createMockRequest();
			const mockResponse = createMockResponse(401);
			const mockOptions: ApiClientOptions = { skipAuth: true };

			await afterResponseInterceptor(mockRequest, mockOptions, mockResponse);

			expect(refreshToken).not.toHaveBeenCalled();
			expect(window.location.href).toBe('');
		});

		it('should not intercept 401 when user is not authenticated', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(false)
			);

			const mockRequest = createMockRequest();
			const mockResponse = createMockResponse(401);
			const mockOptions: ApiClientOptions = {};

			await afterResponseInterceptor(mockRequest, mockOptions, mockResponse);

			expect(refreshToken).not.toHaveBeenCalled();
			expect(window.location.href).toBe('');
		});

		it('should attempt token refresh on 401 when authenticated', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(true)
			);
			vi.mocked(refreshToken).mockResolvedValue(true);

			// Mock fetch for retry
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
			});
			global.fetch = mockFetch;

			const mockRequest = createMockRequest();
			const mockResponse = createMockResponse(401);
			const mockOptions: ApiClientOptions = {};

			const result = await afterResponseInterceptor(
				mockRequest,
				mockOptions,
				mockResponse
			);

			expect(refreshToken).toHaveBeenCalled();
			expect(mockFetch).toHaveBeenCalledWith(mockRequest);
			expect(result).toBeDefined();
		});

		it('should redirect to login when refresh fails', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(true)
			);
			vi.mocked(refreshToken).mockResolvedValue(false);

			const mockRequest = createMockRequest();
			const mockResponse = createMockResponse(401);
			const mockOptions: ApiClientOptions = {};

			await expect(
				afterResponseInterceptor(mockRequest, mockOptions, mockResponse)
			).rejects.toThrow('Unauthorized');

			expect(refreshToken).toHaveBeenCalled();
			expect(window.location.href).toBe('/login');
		});

		it('should handle multiple status codes correctly', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(true)
			);

			const testCases = [200, 201, 400, 403, 404, 500];

			for (const status of testCases) {
				const mockRequest = createMockRequest();
				const mockResponse = createMockResponse(status);
				const mockOptions: ApiClientOptions = {};

				await afterResponseInterceptor(mockRequest, mockOptions, mockResponse);

				expect(refreshToken).not.toHaveBeenCalled();
				expect(window.location.href).toBe('');
			}
		});
	});
});
