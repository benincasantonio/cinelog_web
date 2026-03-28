import type { ChangePasswordRequest } from '@/features/profile/models/change-password-request';
import type { UpdateProfileRequest } from '@/features/profile/models/update-profile-request';
import { apiClient } from '@/lib/api/client';
import type { UserResponse } from '../models/user-response';

export const getUserInfo = async (): Promise<UserResponse> => {
	return await apiClient.get('v1/users/info').json();
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
