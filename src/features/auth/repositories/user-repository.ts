import { apiClient } from '@/lib/api/client';
import type { UserResponse } from '../models/user-response';

export const getUserInfo = async (): Promise<UserResponse> => {
	return await apiClient.get('v1/users/info').json();
};
