import type { ProfileVisibility } from '@/lib/models';

export type UpdateProfileRequest = {
	firstName?: string;
	lastName?: string;
	bio?: string;
	dateOfBirth?: string;
	profileVisibility?: ProfileVisibility;
};
