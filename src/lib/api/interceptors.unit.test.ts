import ky, { HTTPError, type KyRequest } from 'ky';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiClientOptions } from '@/lib/models/api-client-options';
import {
	afterResponseInterceptor,
	beforeRequestInterceptor,
	beforeRetry,
} from './interceptors';

vi.mock('@/features/auth/repositories/auth-repository', () => ({
	refreshToken: vi.fn(),
}));

vi.mock('@/features/auth/stores', () => ({
	useAuthStore: {
		getState: vi.fn(),
		setState: vi.fn(),
	},
}));

import { refreshToken } from '@/features/auth/repositories/auth-repository';
import { useAuthStore } from '@/features/auth/stores';

interface MockAuthState {
	authenticatedStatus: boolean | null;
	isInitialized: boolean;
	csrfToken: string | null;
	userInfo: null;
	isUserInfoLoading: boolean;
	setAuthenticatedStatus: (status: boolean | null) => void;
	setCsrfToken: (csrfToken: string | null) => void;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	register: (request: unknown) => Promise<void>;
	fetchUserInfo: () => Promise<void>;
}

describe('interceptors', () => {
	let originalLocation: Location;

	beforeEach(() => {
		vi.clearAllMocks();
		originalLocation = window.location;
		delete (window as { location?: Location }).location;
		window.location = { href: '' } as Location;
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

		const mockAuthStateWithCsrf = (
			csrfToken: string | null
		): MockAuthState => ({
			authenticatedStatus: true,
			isInitialized: true,
			csrfToken,
			userInfo: null,
			isUserInfoLoading: false,
			setAuthenticatedStatus: vi.fn(),
			setCsrfToken: vi.fn(),
			login: vi.fn(),
			logout: vi.fn(),
			register: vi.fn(),
			fetchUserInfo: vi.fn(),
		});

		it('should add CSRF token to POST requests', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				mockAuthStateWithCsrf('test-csrf-token')
			);
			const mockRequest = createMockRequest('POST');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).toHaveBeenCalledWith(
				'X-CSRF-Token',
				'test-csrf-token'
			);
		});

		it('should add CSRF token to PUT requests', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				mockAuthStateWithCsrf('test-csrf-token')
			);
			const mockRequest = createMockRequest('PUT');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).toHaveBeenCalledWith(
				'X-CSRF-Token',
				'test-csrf-token'
			);
		});

		it('should add CSRF token to DELETE requests', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				mockAuthStateWithCsrf('test-csrf-token')
			);
			const mockRequest = createMockRequest('DELETE');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).toHaveBeenCalledWith(
				'X-CSRF-Token',
				'test-csrf-token'
			);
		});

		it('should add CSRF token to PATCH requests', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				mockAuthStateWithCsrf('test-csrf-token')
			);
			const mockRequest = createMockRequest('PATCH');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).toHaveBeenCalledWith(
				'X-CSRF-Token',
				'test-csrf-token'
			);
		});

		it('should NOT add CSRF token to GET requests', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				mockAuthStateWithCsrf('test-csrf-token')
			);
			const mockRequest = createMockRequest('GET');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).not.toHaveBeenCalled();
		});

		it('should handle lowercase method names', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				mockAuthStateWithCsrf('test-csrf-token')
			);
			const mockRequest = createMockRequest('post');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).toHaveBeenCalledWith(
				'X-CSRF-Token',
				'test-csrf-token'
			);
		});

		it('should not set header when CSRF token is null', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				mockAuthStateWithCsrf(null)
			);
			const mockRequest = createMockRequest('POST');

			await beforeRequestInterceptor(mockRequest, mockOptions);

			expect(mockRequest.headers.set).not.toHaveBeenCalled();
		});
	});

	describe('afterResponseInterceptor', () => {
		const createMockRequest = (): KyRequest => {
			return {
				url: 'https://api.example.com/test',
				method: 'GET',
				headers: {
					set: vi.fn(),
				},
			} as unknown as KyRequest;
		};

		const createMockResponse = (
			status: number,
			url = 'https://api.example.com/v1/movies'
		): Response => {
			return {
				status,
				url,
			} as Response;
		};

		const createMockAuthState = (
			authenticatedStatus: boolean | null
		): MockAuthState => ({
			authenticatedStatus,
			isInitialized: false,
			csrfToken: null,
			userInfo: null,
			isUserInfoLoading: false,
			setAuthenticatedStatus: vi.fn(),
			setCsrfToken: vi.fn(),
			login: vi.fn(),
			logout: vi.fn(),
			register: vi.fn(),
			fetchUserInfo: vi.fn(),
		});

		it('should set authenticatedStatus to true on 200 when status is null', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(null)
			);

			await afterResponseInterceptor(
				createMockRequest(),
				{} as never,
				createMockResponse(200)
			);

			expect(useAuthStore.setState).toHaveBeenCalledWith({
				authenticatedStatus: true,
			});
		});

		it('should not update status on 200 when already authenticated', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(true)
			);

			await afterResponseInterceptor(
				createMockRequest(),
				{} as never,
				createMockResponse(200)
			);

			expect(useAuthStore.setState).not.toHaveBeenCalled();
		});

		it('should not update status on 200 when status is false', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(false)
			);

			await afterResponseInterceptor(
				createMockRequest(),
				{} as never,
				createMockResponse(200)
			);

			expect(useAuthStore.setState).not.toHaveBeenCalled();
		});

		it('should not update status on non-200 responses when status is null', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(null)
			);

			await afterResponseInterceptor(
				createMockRequest(),
				{} as never,
				createMockResponse(401)
			);

			expect(useAuthStore.setState).not.toHaveBeenCalled();
		});

		it.each([
			'/v1/auth/login',
			'/v1/auth/register',
			'/v1/auth/forgot-password',
			'/v1/auth/reset-password',
			'/v1/auth/csrf',
			'/v1/auth/refresh',
		])('should not update status for excluded path %s', async (path) => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(null)
			);

			await afterResponseInterceptor(
				createMockRequest(),
				{} as never,
				createMockResponse(200, `https://api.example.com${path}`)
			);

			expect(useAuthStore.setState).not.toHaveBeenCalled();
		});
	});

	describe('beforeRetry', () => {
		const createMockRequest = (method = 'GET'): KyRequest => {
			return {
				url: 'https://api.example.com/test',
				method,
				headers: {
					set: vi.fn(),
				},
			} as unknown as KyRequest;
		};

		const createHTTPError = (status: number) => {
			const response = new Response(null, { status });
			return new HTTPError(response, createMockRequest(), {} as never);
		};

		const createMockAuthState = (
			authenticatedStatus: boolean | null
		): MockAuthState => ({
			authenticatedStatus,
			isInitialized: false,
			csrfToken: null,
			userInfo: null,
			isUserInfoLoading: false,
			setAuthenticatedStatus: vi.fn(),
			setCsrfToken: vi.fn(),
			login: vi.fn(),
			logout: vi.fn(),
			register: vi.fn(),
			fetchUserInfo: vi.fn(),
		});

		it('should not attempt refresh for non-401 errors', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(true)
			);

			const mockRequest = createMockRequest();
			const error = createHTTPError(403);

			await beforeRetry({
				request: mockRequest,
				options: {} as never,
				error,
				retryCount: 1,
			});

			expect(refreshToken).not.toHaveBeenCalled();
		});

		it('should return ky.stop and not attempt refresh when user is not authenticated', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(false)
			);

			const mockRequest = createMockRequest();
			const error = createHTTPError(401);

			const result = await beforeRetry({
				request: mockRequest,
				options: {} as never,
				error,
				retryCount: 1,
			});

			expect(result).toBe(ky.stop);
			expect(refreshToken).not.toHaveBeenCalled();
		});

		it('should attempt token refresh on 401 when authenticated and set CSRF on POST retry', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(true)
			);
			vi.mocked(refreshToken).mockResolvedValue({
				message: 'Token refreshed',
				csrfToken: 'new-csrf-token',
			});

			const mockRequest = createMockRequest('POST');
			const error = createHTTPError(401);

			await beforeRetry({
				request: mockRequest,
				options: {} as never,
				error,
				retryCount: 1,
			});

			expect(refreshToken).toHaveBeenCalled();
			expect(useAuthStore.setState).toHaveBeenCalledWith({
				csrfToken: 'new-csrf-token',
			});
			expect(mockRequest.headers.set).toHaveBeenCalledWith(
				'X-CSRF-Token',
				'new-csrf-token'
			);
		});

		it('should not set CSRF header on retry for GET requests', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(true)
			);
			vi.mocked(refreshToken).mockResolvedValue({
				message: 'Token refreshed',
				csrfToken: 'new-csrf-token',
			});

			const mockRequest = createMockRequest('GET');
			const error = createHTTPError(401);

			await beforeRetry({
				request: mockRequest,
				options: {} as never,
				error,
				retryCount: 1,
			});

			expect(refreshToken).toHaveBeenCalled();
			expect(mockRequest.headers.set).not.toHaveBeenCalled();
		});

		it('should redirect to login when refresh fails', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(true)
			);
			vi.mocked(refreshToken).mockRejectedValue(new Error('Refresh failed'));

			const mockRequest = createMockRequest();
			const error = createHTTPError(401);

			await expect(
				beforeRetry({
					request: mockRequest,
					options: {} as never,
					error,
					retryCount: 1,
				})
			).rejects.toThrow('Unauthorized');

			expect(refreshToken).toHaveBeenCalled();
			expect(useAuthStore.setState).toHaveBeenCalledWith({
				authenticatedStatus: false,
				userInfo: null,
				csrfToken: null,
			});
			expect(window.location.href).toBe('/login');
		});

		it('should not attempt refresh for non-HTTP errors', async () => {
			vi.mocked(useAuthStore.getState).mockReturnValue(
				createMockAuthState(true)
			);

			const mockRequest = createMockRequest();
			const error = new Error('Network error');

			await beforeRetry({
				request: mockRequest,
				options: {} as never,
				error,
				retryCount: 1,
			});

			expect(refreshToken).not.toHaveBeenCalled();
		});
	});
});
