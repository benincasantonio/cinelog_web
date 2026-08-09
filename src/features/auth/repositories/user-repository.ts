import type { ChangePasswordRequest } from '@/features/profile/models/change-password-request';
import type { UpdateProfileRequest } from '@/features/profile/models/update-profile-request';
import { apiClient } from '@/lib/api/client';
import type { Locale } from '@/lib/models';
import type {
	UpdateLocaleRequest,
	UpdateLocaleResponse,
} from '../models/update-locale';
import type { UserProfileResponse } from '../models/user-profile-response';
import type { UserResponse } from '../models/user-response';

export const getUserInfo = async (): Promise<UserResponse> => {
	return await apiClient.get('v1/users/info').json();
};

export const getProfile = async (
	handle: string
): Promise<UserProfileResponse> => {
	return await apiClient
		.get(`v1/users/${encodeURIComponent(handle)}/profile`)
		.json();
};

export const followUser = async (handle: string): Promise<void> => {
	await apiClient.put(`v1/users/${encodeURIComponent(handle)}/follow`);
};

export const unfollowUser = async (handle: string): Promise<void> => {
	await apiClient.delete(`v1/users/${encodeURIComponent(handle)}/follow`);
};

export const updateLocale = async (
	locale: Locale
): Promise<UpdateLocaleResponse> => {
	const request: UpdateLocaleRequest = { locale };
	const response = await apiClient.put('v1/users/settings/locale', {
		json: request,
	});

	try {
		const body: unknown = await response.json();
		if (
			typeof body === 'object' &&
			body !== null &&
			'locale' in body &&
			typeof body.locale === 'string'
		) {
			return { locale: body.locale as Locale };
		}
	} catch {
		// A successful PUT may still have an empty or malformed response body.
	}

	return { locale };
};

export const updateProfile = async (
	data: UpdateProfileRequest
): Promise<UserResponse> => {
	return await apiClient
		.put('v1/users/settings/profile', { json: data })
		.json<UserResponse>();
};

export const changePassword = async (
	data: ChangePasswordRequest
): Promise<void> => {
	await apiClient.put('v1/users/settings/password', { json: data }).json();
};
