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

export const refreshToken = async (): Promise<RefreshResponse | null> => {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/v1/auth/refresh`,
			{
				method: 'POST',
				credentials: 'include',
			}
		);
		if (response.ok) {
			return await response.json();
		}
		return null;
	} catch (error) {
		console.error('Token refresh failed:', error);
		return null;
	}
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
