import { KyRequest } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientOptions } from './../models/api-client-options';
import {
	afterResponseInterceptor,
	beforeRequestInterceptor,
} from './interceptors';

vi.mock('../firebase', () => ({
	auth: {
		currentUser: {
			getIdToken: vi.fn().mockResolvedValue('mock-token'),
		},
	},
}));

vi.mock('firebase/auth', () => ({
	signOut: vi.fn().mockResolvedValue(undefined),
}));

describe('interceptors', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Before Request Interceptor', () => {
		it('should add authentication headers to requests', async () => {
			const options: ApiClientOptions = {
				skipAuth: false,
			};
			const request = {
				headers: new Headers(),
			} as KyRequest;

			await beforeRequestInterceptor(request, options);
			expect(request.headers.get('Authorization')).toBe('Bearer mock-token');
		});

		it('should format Authorization header with Bearer scheme', async () => {
			const options: ApiClientOptions = {
				skipAuth: false,
			};
			const request = {
				headers: new Headers(),
			} as KyRequest;

			await beforeRequestInterceptor(request, options);

			const authHeader = request.headers.get('Authorization');
			expect(authHeader).toMatch(/^Bearer .+$/);
			expect(authHeader?.startsWith('Bearer ')).toBe(true);
			expect(authHeader?.split(' ')[0]).toBe('Bearer');
			expect(authHeader?.split(' ')[1]).toBe('mock-token');
		});

		it('should not add authentication headers if skipAuth is true', async () => {
			const options: ApiClientOptions = {
				skipAuth: true,
			};
			const request = {
				headers: new Headers(),
			} as KyRequest;

			await beforeRequestInterceptor(request, options);
			expect(request.headers.get('Authorization')).toBeNull();
		});

		it('should not add authentication headers if no current user', async () => {
			// Temporarily override the mock to return null for currentUser
			const firebaseMock = await import('../firebase');
			const originalCurrentUser = firebaseMock.auth.currentUser;
			Object.defineProperty(firebaseMock.auth, 'currentUser', {
				value: null,
				writable: true,
			});

			const options: ApiClientOptions = {
				skipAuth: false,
			};
			const request = {
				headers: new Headers(),
			} as KyRequest;

			await beforeRequestInterceptor(request, options);
			expect(request.headers.get('Authorization')).toBeNull();

			// Restore original mock
			Object.defineProperty(firebaseMock.auth, 'currentUser', {
				value: originalCurrentUser,
				writable: true,
			});
		});

		it('should not add authentication headers if getIdToken() throws an error', async () => {
			// Temporarily override the mock to simulate getIdToken() failure
			const firebaseMock = await import('../firebase');
			const originalCurrentUser = firebaseMock.auth.currentUser;

			const mockError = new Error('Network error: token refresh failed');
			Object.defineProperty(firebaseMock.auth, 'currentUser', {
				value: {
					getIdToken: vi.fn().mockRejectedValue(mockError),
				},
				writable: true,
			});

			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const options: ApiClientOptions = {
				skipAuth: false,
			};
			const request = {
				headers: new Headers(),
			} as KyRequest;

			await beforeRequestInterceptor(request, options);

			expect(request.headers.get('Authorization')).toBeNull();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Failed to get ID token:',
				mockError
			);

			// Restore original mock
			Object.defineProperty(firebaseMock.auth, 'currentUser', {
				value: originalCurrentUser,
				writable: true,
			});
			consoleSpy.mockRestore();
		});
	});

	describe('After Response Interceptor', () => {
		let redirectUrl: string;

		beforeEach(() => {
			redirectUrl = '';
			Object.defineProperty(window, 'location', {
				value: {
					get href() {
						return redirectUrl;
					},
					set href(url: string) {
						redirectUrl = url;
					},
				},
				writable: true,
			});
		});

		it('should redirect to login page if unauthorized', async () => {
			const { signOut } = await import('firebase/auth');
			const { auth } = await import('../firebase');

			const options: ApiClientOptions = {
				skipAuth: false,
			};
			const request = {} as Request;
			const response = {
				status: 401,
			} as Response;

			await expect(
				afterResponseInterceptor(request, options, response)
			).rejects.toThrow('Unauthorized');

			expect(signOut).toHaveBeenCalledWith(auth);
			expect(redirectUrl).toBe('/login');
		});

		it('should not redirect for successful responses (200)', async () => {
			const options: ApiClientOptions = {
				skipAuth: false,
			};
			const request = {} as Request;
			const response = {
				status: 200,
			} as Response;

			await expect(
				afterResponseInterceptor(request, options, response)
			).resolves.toBeUndefined();

			expect(redirectUrl).toBe('');
		});

		it('should not redirect for server errors (500)', async () => {
			const options: ApiClientOptions = {
				skipAuth: false,
			};
			const request = {} as Request;
			const response = {
				status: 500,
			} as Response;

			await expect(
				afterResponseInterceptor(request, options, response)
			).resolves.toBeUndefined();

			expect(redirectUrl).toBe('');
		});

		it('should not redirect when 401 and skipAuth is true', async () => {
			const options: ApiClientOptions = {
				skipAuth: true,
			};
			const request = {} as Request;
			const response = {
				status: 401,
			} as Response;

			await expect(
				afterResponseInterceptor(request, options, response)
			).resolves.toBeUndefined();

			expect(redirectUrl).toBe('');
		});

		it('should not redirect for 403 Forbidden responses', async () => {
			const { signOut } = await import('firebase/auth');

			const options: ApiClientOptions = {
				skipAuth: false,
			};
			const request = {} as Request;
			const response = {
				status: 403,
			} as Response;

			await expect(
				afterResponseInterceptor(request, options, response)
			).resolves.toBeUndefined();

			expect(signOut).not.toHaveBeenCalled();
			expect(redirectUrl).toBe('');
		});

		it('should handle multiple 401 responses in quick succession', async () => {
			const { signOut } = await import('firebase/auth');
			const { auth } = await import('../firebase');

			const options: ApiClientOptions = {
				skipAuth: false,
			};
			const request = {} as Request;
			const response = {
				status: 401,
			} as Response;

			// Simulate multiple 401 responses in quick succession
			const promises = [
				afterResponseInterceptor(request, options, response).catch((e) => e),
				afterResponseInterceptor(request, options, response).catch((e) => e),
				afterResponseInterceptor(request, options, response).catch((e) => e),
			];

			const results = await Promise.all(promises);

			// All should throw 'Unauthorized' error
			results.forEach((result) => {
				expect(result).toBeInstanceOf(Error);
				expect(result.message).toBe('Unauthorized');
			});

			// signOut should have been called for each 401 response
			expect(signOut).toHaveBeenCalledTimes(3);
			expect(signOut).toHaveBeenCalledWith(auth);
			expect(redirectUrl).toBe('/login');
		});
	});
});
