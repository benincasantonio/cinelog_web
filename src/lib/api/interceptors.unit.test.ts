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
	});
});
