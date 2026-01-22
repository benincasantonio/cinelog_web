import { signOut } from 'firebase/auth';
import { type KyRequest } from 'ky';
import type { ApiClientOptions } from '@/lib/models/api-client-options';
import { auth } from '../firebase';

/**
 * Interceptor that adds authentication headers to requests.
 *
 * If the request is marked as `skipAuth`, no headers are added.
 * Otherwise, the current user's ID token is fetched and added to the request.
 */
export const beforeRequestInterceptor = async (
	request: KyRequest,
	options: ApiClientOptions
) => {
	if (options.skipAuth) return;

	const user = auth.currentUser;
	if (!user) return;

	const token = await user.getIdToken();

	request.headers.set('Authorization', `Bearer ${token}`);
};

/**
 * Interceptor that handles authentication errors.
 *
 * If the response status is 401 and the request is not marked as `skipAuth`,
 * the user is signed out and redirected to the login page.
 */
export const afterResponseInterceptor = async (
	_request: Request,
	options: ApiClientOptions,
	response: Response
) => {
	if (response.status === 401 && !options.skipAuth) {
		await signOut(auth);
		window.location.href = '/login';
		throw new Error('Unauthorized');
	}
};
