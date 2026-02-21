import {
	type BeforeRetryHook,
	type BeforeRetryState,
	isHTTPError,
	type KyRequest,
} from 'ky';
import type { RefreshResponse } from '@/features/auth/models/auth-responses';
import { refreshToken } from '@/features/auth/repositories/auth-repository';
import { useAuthStore } from '@/features/auth/stores';
import type { ApiClientOptions } from '@/lib/models/api-client-options';

let refreshPromise: Promise<RefreshResponse> | null = null;

/**
 * Interceptor that adds CSRF token to mutation requests.
 *
 * For mutation requests (POST, PUT, DELETE, PATCH), reads the CSRF token
 * from the auth store and adds it as a header.
 */
export const beforeRequestInterceptor = async (
	request: KyRequest,
	_options: ApiClientOptions
) => {
	const method = request.method.toUpperCase();
	if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
		const csrfToken = useAuthStore.getState().csrfToken;
		if (csrfToken) {
			request.headers.set('X-CSRF-Token', csrfToken);
		}
	}
};

/**
 * Interceptor that handles authentication errors.
 *
 * If the response status is 401, attempts to refresh the token.
 * If refresh fails, redirects to login page.
 */
export const beforeRetry = async (options: BeforeRetryState) => {
	const isAuthenticated = useAuthStore.getState().isAuthenticated;

	if (
		isAuthenticated &&
		isHTTPError(options.error) &&
		options.error.response.status === 401
	) {
		if (!refreshPromise) {
			refreshPromise = refreshToken()
				.then((refreshData) => {
					return refreshData;
				})
				.catch(() => {
					refreshPromise = null;
					window.location.href = '/login';
					throw new Error('Unauthorized');
				})
				.finally(() => {
					refreshPromise = null;
				});
		}

		await refreshPromise;
	}
};
