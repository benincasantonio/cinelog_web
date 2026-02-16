import { type KyRequest } from 'ky';
import { refreshToken } from '@/features/auth/repositories/auth-repository';
import { useAuthStore } from '@/features/auth/stores';
import type { ApiClientOptions } from '@/lib/models/api-client-options';
import { getCsrfTokenFromCookie } from '@/lib/utils/auth.utils';

/**
 * Interceptor that adds CSRF token to mutation requests.
 *
 * For mutation requests (POST, PUT, DELETE, PATCH), reads the CSRF token
 * from the cookie and adds it as a header (Double Submit Cookie pattern).
 */
export const beforeRequestInterceptor = async (
	request: KyRequest,
	_options: ApiClientOptions
) => {
	const method = request.method.toUpperCase();
	if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
		const csrfToken = getCsrfTokenFromCookie();
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
		const refreshSuccess = await refreshToken();

		if (refreshSuccess) {
			// Token refreshed successfully, retry the original request
			return fetch(request);
		}

		// Refresh failed, redirect to login
		window.location.href = '/login';
		throw new Error('Unauthorized');
	}
};
