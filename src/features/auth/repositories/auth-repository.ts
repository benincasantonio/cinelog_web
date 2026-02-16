import { apiClient } from '@/lib/api/client';
import type { ApiClientOptions } from '@/lib/models/api-client-options';
import type { RegisterRequest } from '../models/register-request';

export const fetchCsrfToken = async (): Promise<void> => {
	try {
		await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/csrf`, {
			credentials: 'include',
		});
	} catch (error) {
		console.error('Failed to fetch CSRF token:', error);
	}
};

export const login = async (email: string, password: string): Promise<void> => {
	await apiClient
		.post('v1/auth/login', {
			json: { email, password },
			skipAuth: true,
		} as ApiClientOptions)
		.json();
};

export const logout = async (): Promise<void> => {
	await apiClient.post('v1/auth/logout').json();
};

export const refreshToken = async (): Promise<boolean> => {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/v1/auth/refresh`,
			{
				method: 'POST',
				credentials: 'include',
			}
		);
		return response.ok;
	} catch (error) {
		console.error('Token refresh failed:', error);
		return false;
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
