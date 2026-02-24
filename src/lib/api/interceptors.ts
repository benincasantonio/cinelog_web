import ky, {
	type BeforeRetryState,
	isHTTPError,
	type KyRequest,
	type NormalizedOptions,
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
	options: ApiClientOptions
) => {
	if (options.skipAuth) {
		return;
	}

	const method = request.method.toUpperCase();
	if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
		const csrfToken = useAuthStore.getState().csrfToken;

		if (csrfToken) {
			request.headers.set('X-CSRF-Token', csrfToken);
		}
	}
};

export const afterResponseInterceptor = async (
	_request: KyRequest,
	_options: NormalizedOptions,
	response: Response
) => {
	const authStatus = useAuthStore.getState().authenticatedStatus;

	const excludePaths = [
		'/v1/auth/login',
		'/v1/auth/register',
		'/v1/auth/forgot-password',
		'/v1/auth/reset-password',
		'/v1/auth/csrf',
		'/v1/auth/refresh',
	];

	if (
		authStatus === null &&
		response.status === 200 &&
		!excludePaths.some((path) => response.url.includes(path))
	) {
		useAuthStore.setState({ authenticatedStatus: true });
	}
};

/**
 * Interceptor that handles authentication errors.
 *
 * If the response status is 401, attempts to refresh the token.
 * If refresh fails, redirects to login page.
 */
export const beforeRetryInterceptor = async (options: BeforeRetryState) => {
	const authStatus = useAuthStore.getState().authenticatedStatus;
	if (authStatus === false) {
		return ky.stop;
	}

	if (isHTTPError(options.error) && options.error.response.status === 401) {
		if (!refreshPromise) {
			refreshPromise = refreshToken()
				.then((refreshData) => {
					useAuthStore.setState({
						csrfToken: refreshData.csrfToken,
					});
					const method = options.request.method.toUpperCase();
					if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
						options.request.headers.set('X-CSRF-Token', refreshData.csrfToken);
					}
					return refreshData;
				})
				.catch(() => {
					useAuthStore.setState({
						authenticatedStatus: false,
						userInfo: null,
						csrfToken: null,
					});
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
