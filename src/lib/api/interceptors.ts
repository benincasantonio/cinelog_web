import { type KyRequest } from 'ky';
import { refreshToken } from '@/features/auth/repositories/auth-repository';
import { useAuthStore } from '@/features/auth/stores';
import type { ApiClientOptions } from '@/lib/models/api-client-options';

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
export const afterResponseInterceptor = async (
	request: Request,
	options: ApiClientOptions,
	response: Response
) => {
	const isAuthenticated = useAuthStore.getState().isAuthenticated;

	if (isAuthenticated && response.status === 401 && !options.skipAuth) {
		// Try to refresh token
		const refreshResponse = await refreshToken();

		if (refreshResponse) {
			// Token refreshed successfully, update CSRF and retry the original request
			useAuthStore.getState().setCsrfToken(refreshResponse.csrfToken);

			request.headers.set('X-CSRF-Token', refreshResponse.csrfToken);

			return fetch(request);
		}

		// Refresh failed, redirect to login
		window.location.href = '/login';
		throw new Error('Unauthorized');
	}
};
