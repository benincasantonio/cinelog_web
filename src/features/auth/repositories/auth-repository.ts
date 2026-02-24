import { apiClient } from '@/lib/api/client';
import type { ApiClientOptions } from '@/lib/models/api-client-options';
import type {
	CsrfTokenResponse,
	LoginResponse,
	RefreshResponse,
} from '../models/auth-responses';
import type { ForgotPasswordRequest } from '../models/forgot-password';
import type { RegisterRequest } from '../models/register-request';
import type { ResetPasswordRequest } from '../models/reset-password';

/**
 * Uses raw fetch() instead of apiClient to avoid a circular dependency:
 * the CSRF token is needed by the beforeRequest interceptor, so fetching
 * it through ky would trigger the interceptor before we have a token.
 */
export const fetchCsrfToken = async (): Promise<CsrfTokenResponse> => {
	const response = await fetch(`${import.meta.env.VITE_API_URL}v1/auth/csrf`, {
		credentials: 'include',
	});
	if (!response.ok) {
		throw new Error(
			`Failed to fetch CSRF token: ${response.status} ${response.statusText}`
		);
	}
	return await response.json();
};

export const login = async (
	email: string,
	password: string
): Promise<LoginResponse> => {
	return await apiClient
		.post('v1/auth/login', {
			json: { email, password },
			skipAuth: true,
		} as ApiClientOptions)
		.json<LoginResponse>();
};

export const logout = async (): Promise<void> => {
	await apiClient.post('v1/auth/logout').json();
};

/**
 * Uses raw fetch() instead of apiClient to avoid an infinite retry loop:
 * the beforeRetry interceptor calls refreshToken, so routing this through
 * ky would re-enter the interceptor chain on failure.
 */
export const refreshToken = async (): Promise<RefreshResponse> => {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}v1/auth/refresh`,
		{
			method: 'POST',
			credentials: 'include',
		}
	);

	if (!response.ok) {
		throw new Error(`Refresh failed: ${response.status}`);
	}

	return await response.json();
};

export const register = async (request: RegisterRequest): Promise<void> => {
	return await apiClient
		.post('v1/auth/register', {
			json: request,
			skipAuth: true,
		} as ApiClientOptions)
		.json();
};

export const forgotPassword = async (
	request: ForgotPasswordRequest
): Promise<void> => {
	await apiClient
		.post('v1/auth/forgot-password', {
			json: request,
			skipAuth: true,
		} as ApiClientOptions)
		.json();
};

export const resetPassword = async (
	request: ResetPasswordRequest
): Promise<void> => {
	await apiClient
		.post('v1/auth/reset-password', {
			json: request,
			skipAuth: true,
		} as ApiClientOptions)
		.json();
};
