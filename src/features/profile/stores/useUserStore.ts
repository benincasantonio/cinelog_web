import { create } from 'zustand';
import type { UserResponse } from '@/features/auth/models/user-response';
import {
	changePassword as changePasswordApi,
	updateProfile,
} from '@/features/auth/repositories/user-repository';
import type { ChangePasswordRequest } from '../models/change-password-request';
import type { UpdateProfileRequest } from '../models/update-profile-request';

export const useUserStore = create<{
	updateProfile: (data: UpdateProfileRequest) => Promise<UserResponse>;
	changePassword: (data: ChangePasswordRequest) => Promise<void>;
}>(() => ({
	updateProfile: async (data: UpdateProfileRequest) => {
		return await updateProfile(data);
	},
	changePassword: async (data: ChangePasswordRequest) => {
		await changePasswordApi(data);
	},
}));
